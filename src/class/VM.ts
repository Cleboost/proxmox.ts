import { VMConfig, VMStatus } from "../types/VM";
import { FetchClient, FetchClientImpl } from "../utils/FetchClient";
import { VMNotFoundError } from "../errors/VMNotFoundError";

export default class VM {
	private id: number;
	private client: FetchClient;
	private configCache: VMConfig | null = null;

	constructor(id: number, client: FetchClient) {
		this.id = id;
		this.client = new FetchClientImpl(`${client.baseURL}/qemu/${id}`, { ...client.headers });
	}

	public async getConfig(forceRefresh = false): Promise<VMConfig> {
		if (this.configCache && !forceRefresh) return this.configCache;
		try {
			const res = await this.client.get("/config");
			const d = res.data.data;
		["onboot", "kvm", "numa"].forEach((k) => typeof d[k] !== "undefined" && (d[k] = d[k] === 1));
		if (typeof d.hotplug === "string") {
			const f = d.hotplug.split(",").map((x: string) => x.trim().toLowerCase());
			d.hotplug = { cpu: f.includes("cpu"), disk: f.includes("disk"), network: f.includes("network"), usb: f.includes("usb"), memory: f.includes("memory") };
		}
		d.networks = Object.keys(d)
			.filter((k) => /^net\d+$/.test(k))
			.map((netKey) => {
				const net: any = { name: netKey },
					parts = d[netKey].split(",").map((p: string) => p.trim());
				parts.forEach((part: string, i: number) => {
					if (i === 0 && part.includes("=")) {
						const [model, mac] = part.split("=");
						net.model = model;
						net.mac = mac;
					} else if (part.includes("=")) {
						const [k, v] = part.split("=");
						net[k] = k === "firewall" ? v === "1" : v;
					}
				});
				const ipKey = netKey.replace("net", "ipconfig");
				if (typeof d[ipKey] === "string") {
					const ip: any = { ip: undefined, dhcp: false, gateway: undefined };
					d[ipKey]
						.split(",")
						.map((p: string) => p.trim())
						.forEach((part: string) => {
							if (part === "ip=dhcp") ip.dhcp = true;
							else if (part.startsWith("ip=")) ip.ip = part.replace("ip=", "");
							else if (part.startsWith("gw=")) ip.gateway = part.replace("gw=", "");
						});
					net.config = ip;
					delete d[ipKey];
				}
				delete d[netKey];
				return net;
			});
		d.disks = Object.keys(d)
			.filter((k) => /^(scsi|ide)\d+$/.test(k))
			.map((diskKey) => {
				const parts = d[diskKey].split(",").map((p: string) => p.trim()),
					disk: any = { name: diskKey };
				if (parts[0].includes(":")) {
					const [storage, volume] = parts[0].split(":");
					disk.storage = storage;
					disk.volume = volume;
				}
				for (let i = 1; i < parts.length; i++) {
					const [k, v] = parts[i].split("=");
					if (k && v) disk[k] = v === "1" || v === "0" ? v === "1" : k === "size" ? wrapSize(v) : v;
				}
				delete d[diskKey];
				return disk;
			});
		if (typeof d.boot === "string") {
			const m = d.boot.match(/order=([^,]+)/);
			if (m)
				d.bootOrder = m[1]
					.split(";")
					.join(",")
					.split(",")
					.filter(Boolean)
					.map((diskName: string, i: number) => ({ position: i + 1, diskName }));
			delete d.boot;
		}
		if (typeof d.memory === "string" || typeof d.memory === "number") {
			const mem = typeof d.memory === "string" ? parseFloat(d.memory) : d.memory;
			d.memory = { raw: mem, mo: mem, go: mem / 1024 };
		}
		if (typeof d.ciuser !== "undefined") {
			d.user = d.ciuser;
			delete d.ciuser;
		}
		if (typeof d.cipassword !== "undefined") {
			d.password = d.cipassword;
			delete d.cipassword;
		}
		if (typeof d.meta === "string") {
			const metaObj: any = {};
			d.meta.split(",").forEach((part: string) => {
				const [k, v] = part.split("=");
				if (k && v) metaObj[k.trim()] = v.trim();
			});
			d.meta = metaObj;
		}
		this.configCache = d;
		return d;
		} catch (error: any) {
			if (error instanceof VMNotFoundError) {
				throw error;
			}
			throw error;
		}
	}

	public async getStatus(): Promise<VMStatus> {
		return this.client.get("/status/current").then((res) => {
			const d = res.data.data;
			d.isRunning = d.status === "running" || d.qmpstatus === "running";
			d.hasAgent = d.agent === 1;
			if (typeof d.maxmem === "number") d.maxMemory = wrapSize(d.maxmem, true);
			if (typeof d.mem === "number") d.currentMemory = wrapSize(d.mem, true);
			if (typeof d.freemem === "number") d.freeMemory = wrapSize(d.freemem, true);
			if (typeof d.balloon === "number") d.balloonMemory = wrapSize(d.balloon, true);
			if (typeof d.maxdisk === "number") d.maxDisk = wrapSize(d.maxdisk, true);
			if (typeof d.diskread === "number") d.diskRead = wrapSize(d.diskread, true);
			if (typeof d.diskwrite === "number") d.diskWrite = wrapSize(d.diskwrite, true);
			if (d.nics && typeof d.nics === "object") {
				d.networkStats = Object.entries(d.nics).map(([nic, val]: [string, any]) => ({ name: nic, bytesIn: wrapSize(val.netin, true), bytesOut: wrapSize(val.netout, true) }));
				delete d.nics;
			}
			if (d.blockstat && typeof d.blockstat === "object") {
				d.diskStats = Object.entries(d.blockstat).map(([disk, stat]: [string, any]) => ({ name: disk, ...stat }));
				delete d.blockstat;
			}
			if (d.ballooninfo && typeof d.ballooninfo === "object") {
				d.balloonInfo = d.ballooninfo;
				delete d.ballooninfo;
			}
			if (d.ha && typeof d.ha === "object") {
				d.isHaManaged = d.ha.managed === 1;
				delete d.ha;
			}
			if (d["proxmox-support"]) {
				d.proxmoxSupport = d["proxmox-support"];
				delete d["proxmox-support"];
			}
			if (d.vmid) {
				d.vmId = d.vmid;
				delete d.vmid;
			}
			if (d.cpus) {
				d.cpuCount = d.cpus;
				delete d.cpus;
			}
			if (d.uptime) d.uptimeSeconds = d.uptime;
			if (d.status) d.statusText = d.status;
			if (d.qmpstatus) d.qmpStatus = d.qmpstatus;
			return d;
		}).catch((error: any) => {
			if (error instanceof VMNotFoundError) {
				throw error;
			}
			throw error;
		});
	}

	public async powerAction(action: "start" | "stop" | "reset" | "suspend" | "shutdown"): Promise<any> {
		if (!["start", "stop", "reset", "suspend", "shutdown"].includes(action)) {
			throw new Error("Invalid action. Valid actions are: start, stop, reset, suspend, shutdown.");
		}
		try {
			await this.client.post(`/status/${action}`, null);
			await this.getConfig(true);
			return true;
		} catch (err: any) {
			console.error("Error during power action:", err.message || err);
			return false;
		}
	}

	public async addInterface({ model = "virtio", mac, bridge, firewall }: { model?: "virtio"; mac?: string; bridge: string; firewall?: boolean }): Promise<any> {
		if (!bridge) throw new Error("Bridge is required.");
		if (mac && !/^[0-9A-F]{2}(:[0-9A-F]{2}){5}$/i.test(mac)) throw new Error("Invalid MAC address format.");
		if (!/^[a-zA-Z0-9_.-]+$/.test(bridge)) throw new Error("Invalid bridge name format.");
		let netConfig = `model=${model}`;
		if (mac) netConfig += `,mac=${mac}`;
		netConfig += `,bridge=${bridge}`;
		if (firewall) netConfig += ",firewall=1";
		const config = await this.getConfig();
		const existingNets = Array.isArray(config.networks) ? config.networks : [];
		const maxIndex = existingNets
			.map((net) => {
				const match = net.name.match(/^net(\d+)$/);
				return match ? parseInt(match[1], 10) : -1;
			})
			.reduce((max, curr) => (curr > max ? curr : max), -1);
		const nextIndex = maxIndex + 1;
		const result = await this.client.post("/config", { [`net${nextIndex}`]: netConfig });
		await this.getConfig(true);
		return result;
	}

	public async removeInterface(name: string): Promise<any> {
		if (!name) throw new Error("Name is required.");
		if (!/^(net\d+)$/.test(name)) throw new Error("Invalid interface name format. Expected format: netX (X is a number).");
		const config = await this.getConfig();
		const exists = Array.isArray(config.networks) && config.networks.some((net) => net.name === name);
		if (!exists) throw new Error(`Interface ${name} does not exist.`);
		try {
			await this.client.put("/config", { delete: name });
			await this.getConfig(true);
			return true;
		} catch (err: any) {
			console.error("Error during interface removal:", err.message || err);
			return false;
		}
	}
}

function wrapSize(size: string | number, isBytes = false) {
	if (typeof size === "number" && isBytes) {
		const go = size / (1024 * 1024 * 1024);
		const mo = size / (1024 * 1024);
		return { raw: size, mo, go };
	}
	const regex = /([\d.]+)([KMGTP]?)B?/i;
	const match = String(size).match(regex);
	if (!match) return { raw: size };
	const value = parseFloat(match[1]);
	const unit = match[2].toUpperCase();
	let mo = undefined,
		go = undefined;
	if (unit === "G") {
		go = value;
		mo = value * 1024;
	} else if (unit === "M") {
		mo = value;
		go = value / 1024;
	} else if (unit === "T") {
		go = value * 1024;
		mo = value * 1024 * 1024;
	}
	return { raw: size, mo, go };
}
