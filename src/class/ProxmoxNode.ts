import { ProxmoxNodeOptions, ProxmoxVersion, VMCount } from "../types/ProxmoxNode";
import VM from "./VM";
import { FetchClient, FetchClientImpl } from "../utils/FetchClient";

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
}
