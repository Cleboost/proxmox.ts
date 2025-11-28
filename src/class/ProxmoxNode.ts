import { ProxmoxNodeOptions } from "../types/ProxmoxNode";
import VM from "./VM";
import { FetchClient, FetchClientImpl } from "../utils/FetchClient";

export default class ProxmoxNode {
	private url: string;
	private tokenID: string;
	private client: FetchClient;
	private tokenSecret: string;

	constructor({ host, node, port = 8006, tokenID, tokenSecret }: ProxmoxNodeOptions) {
		this.url = `${host}:${port}/api2/json/nodes/${node}`;
		this.tokenID = tokenID;
		this.tokenSecret = tokenSecret;
		this.client = new FetchClientImpl(this.url, {
			"Authorization": `PVEAPIToken=${this.tokenID}=${this.tokenSecret}`,
			"Content-Type": "application/json",
		});
	}

	public VM(id: number) {
		return new VM(id, this.client);
	}
}
