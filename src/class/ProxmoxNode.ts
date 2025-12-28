import { ProxmoxNodeOptions, ProxmoxVersion, VMCount } from "../types/ProxmoxNode";
import VM from "./VM";
import { FetchClient, FetchClientImpl } from "../utils/FetchClient";
import { VMNotFoundError } from "../errors/VMNotFoundError";
import { VMPermissionError } from "../errors/VMPermissionError";

export default class ProxmoxNode {
	private url: string;
	private tokenID: string;
	private client: FetchClient;
	private tokenSecret: string;
	private baseUrl: string;
	private rootClient: FetchClient;

	constructor({ host, node, port = 8006, tokenID, tokenSecret }: ProxmoxNodeOptions) {
		this.baseUrl = `${host}:${port}/api2/json`;
		this.url = `${this.baseUrl}/nodes/${node}`;
		this.tokenID = tokenID;
		this.tokenSecret = tokenSecret;
		const headers = {
			"Authorization": `PVEAPIToken=${this.tokenID}=${this.tokenSecret}`,
			"Content-Type": "application/json",
		};
		this.client = new FetchClientImpl(this.url, headers);
		this.rootClient = new FetchClientImpl(this.baseUrl, headers);
	}

	public VM(id: number) {
		return new VM(id, this.client);
	}

	public async version(): Promise<ProxmoxVersion> {
		const res = await this.rootClient.get<{ data: ProxmoxVersion }>("/version");
		return res.data.data;
	}

	public async countVm(): Promise<VMCount> {
		const res = await this.client.get<{ data: Array<{ vmid: number; status: string; template?: number }> }>("/qemu");
		const vms = res.data.data;
		
		let online = 0;
		let offline = 0;
		let template = 0;

		vms.forEach((vm) => {
			if (vm.template === 1) {
				template++;
			} else if (vm.status === "running") {
				online++;
			} else {
				offline++;
			}
		});

		return {
			online,
			offline,
			template,
			total: vms.length,
		};
	}

	public async clone(idToClone: number, newId: number, options?: { target?: string; storage?: string; name?: string }): Promise<VM> {
		if (!idToClone || idToClone <= 0) {
			throw new Error("Invalid source VM ID");
		}
		if (!newId || newId <= 0) {
			throw new Error("Invalid new VM ID");
		}
		if (idToClone === newId) {
			throw new Error("Source VM ID and new VM ID must be different");
		}

		if (options?.name && !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(options.name)) {
			throw new Error(`Invalid VM name: "${options.name}". Name must be a valid DNS name (alphanumeric, hyphens, and dots only, no spaces or special characters).`);
		}

		const cloneData: Record<string, any> = { newid: newId, full: 1 };
		if (options?.target) cloneData.target = options.target;
		if (options?.storage) cloneData.storage = options.storage;
		if (options?.name) cloneData.name = options.name;

		await this.client.post(`/qemu/${idToClone}/clone`, cloneData);
		return this.VM(newId);
	}

	public async remove(vmId: number): Promise<boolean> {
		if (!vmId || vmId <= 0) {
			throw new Error("Invalid VM ID");
		}

		try {
			await this.client.delete(`/qemu/${vmId}`);
			return true;
		} catch (error: any) {
			if (error instanceof VMNotFoundError || error instanceof VMPermissionError) {
				throw error;
			}
			throw new Error(`Failed to remove VM ${vmId}: ${error.message || "Unknown error"}`);
		}
	}
}
