import { VMNotFoundError } from "../errors/VMNotFoundError";
import { VMPermissionError } from "../errors/VMPermissionError";

export interface FetchClient {
	baseURL: string;
	headers: Record<string, string>;
	get<T = any>(url: string): Promise<{ data: T }>;
	post<T = any>(url: string, body?: any): Promise<{ data: T }>;
	put<T = any>(url: string, body?: any): Promise<{ data: T }>;
}

export class FetchClientImpl implements FetchClient {
	public baseURL: string;
	public headers: Record<string, string>;

	constructor(baseURL: string, headers: Record<string, string>) {
		this.baseURL = baseURL;
		this.headers = headers;
		if (typeof process !== "undefined" && process.env) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		}
	}

	private async request<T>(url: string, options: RequestInit = {}): Promise<{ data: T }> {
		const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;
		
		try {
			const response = await fetch(fullUrl, {
				...options,
				headers: {
					...this.headers,
					...options.headers,
				},
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData?.message || errorData?.data?.message || "";
				
				if (this.baseURL.includes("/qemu/")) {
					const vmIdMatch = this.baseURL.match(/\/qemu\/(\d+)/);
					if (vmIdMatch) {
						const vmId = parseInt(vmIdMatch[1], 10);
						
						if (response.status === 500 && errorMessage.includes("does not exist")) {
							throw new VMNotFoundError(vmId, errorMessage);
						}
						
						if (response.status === 403) {
							throw new VMPermissionError(vmId, errorMessage);
						}
					}
				}
				
				console.error("Error response:", errorData);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			return { data };
		} catch (error: any) {
			if (error instanceof VMNotFoundError || error instanceof VMPermissionError) {
				throw error;
			}
			
			if (error.message) {
				console.error("Error message:", error.message);
			} else {
				console.error("Error request:", error);
			}
			throw error;
		}
	}

	async get<T = any>(url: string): Promise<{ data: T }> {
		return this.request<T>(url, { method: "GET" });
	}

	async post<T = any>(url: string, body?: any): Promise<{ data: T }> {
		return this.request<T>(url, {
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async put<T = any>(url: string, body?: any): Promise<{ data: T }> {
		return this.request<T>(url, {
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		});
	}
}

