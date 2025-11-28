export interface ProxmoxNodeOptions {
	node: string;
	host: string;
	port?: number;
	tokenID: string;
	tokenSecret: string;
}

export interface ProxmoxVersion {
	version: string;
	release: string;
	repoid: string;
}

export interface VMCount {
	online: number;
	offline: number;
	template: number;
	total: number;
}
