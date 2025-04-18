import axios, { AxiosInstance } from "axios";
import { ProxmoxNodeOptions } from "../types/ProxmoxNode";
import VM from "./VM";

export default class ProxmoxNode {
	private url: string;
	private tokenID: string;
	private client: AxiosInstance;
	private tokenSecret: string;

	constructor({ host, node, port = 8006, tokenID, tokenSecret }: ProxmoxNodeOptions) {
		this.url = `${host}:${port}/api2/json/nodes/${node}`;
		this.tokenID = tokenID;
		this.tokenSecret = tokenSecret;
		this.client = axios.create({
			baseURL: this.url,
			headers: {
				"Authorization": `PVEAPIToken=${this.tokenID}=${this.tokenSecret}`,
				"Content-Type": "application/json",
			},
		});
		//add interceptors to handle permissions and errors
		this.client.interceptors.response.use(
			(response) => {
				return response;
			},
			(error) => {
				if (error.response) {
					console.error("Error response:", error.response.data);
				} else if (error.request) {
					console.error("Error request:", error.request);
				} else {
					console.error("Error message:", error.message);
				}
				return Promise.reject(error);
			}

		)

	}

	public VM(id: number) {
		return new VM(id, this.client);
	}
}
