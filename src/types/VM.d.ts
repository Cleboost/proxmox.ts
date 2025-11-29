export interface HotplugConfig {
	cpu: boolean;
	disk: boolean;
	network: boolean;
	usb: boolean;
	memory: boolean;
}

export interface NetConfig {
	name: string;
	model?: string;
	mac?: string;
	bridge?: string;
	firewall?: boolean;
	[key: string]: any;
	config?: IPConfig;
}

export interface IPConfig {
	ip?: string;
	dhcp: boolean;
	gateway?: string;
}

export interface Size {
	raw: string | number;
	mo: number;
	go: number;
}

export interface NetworkStat {
	name: string;
	bytesIn: Size;
	bytesOut: Size;
}

export interface DiskStat {
	name: string;
	[key: string]: any;
}

export interface BalloonInfo {
	last_update: number;
	minor_page_faults: number;
	free_mem: number;
	actual: number;
	max_mem: number;
	mem_swapped_out: number;
	total_mem: number;
	mem_swapped_in: number;
	major_page_faults: number;
}

export interface ProxmoxSupport {
	[key: string]: boolean | string;
}

export interface VMStatus {
	qmpstatus: string;
	maxmem: number;
	netout: number;
	serial: number;
	netin: number;
	maxdisk: number;
	name: string;
	disk: number;
	cpu: number;
	mem: number;
	diskread: number;
	uptime: number;
	status: string;
	diskwrite: number;
	agent: number;
	isRunning: boolean;
	hasAgent: boolean;
	maxMemory: Size;
	currentMemory: Size;
	maxDisk: Size;
	diskRead: Size;
	diskWrite: Size;
	isHaManaged: boolean;
	vmId: number;
	cpuCount: number;
	statusText: "running" | "stopped" | "paused" | "unknown" | "error" | string;
	qmpStatus: "running" | "stopped" | "paused" | "unknown" | "error" | string;
	[key: string]: any;
}

export interface MetaConfig {
	[key: string]: string;
}

export interface DiskConfig {
	name: string;
	storage?: string;
	volume?: string;
	media?: string;
	size?: Size;
	backup?: boolean;
	iothread?: boolean;
	[key: string]: any;
}

export interface VMConfig {
	user?: string;
	password?: string;
	kvm?: boolean;
	numa?: boolean;
	onboot?: boolean;
	memory?: Size;
	digest?: string;
	smbios1?: string;
	serial0?: string;
	net0?: string;
	cores?: number;
	vmgenid?: string;
	name?: string;
	sockets?: number;
	ide2?: string;
	scsihw?: string;
	bootOrder?: { position: number; diskName: string }[];
	meta?: MetaConfig;
	scsi0?: string;
	agent?: string | number;
	hotplug?: HotplugConfig;
	networks?: NetConfig[];
	disks?: DiskConfig[];
	cpu?: string;
	ostype?: string;
	[key: string]: any;
}

export enum VMPowerAction {
	START = "start",
	STOP = "stop",
	RESET = "reset",
	SUSPEND = "suspend",
	SHUTDOWN = "shutdown",
}
