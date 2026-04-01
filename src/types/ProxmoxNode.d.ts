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

export interface ProxmoxRaw {
	$get<T = any>(url: string): Promise<T>;
	$post<T = any>(url: string, body?: any): Promise<T>;
	$put<T = any>(url: string, body?: any): Promise<T>;
	$delete<T = any>(url: string): Promise<T>;
}
