export class VMNotFoundError extends Error {
	public readonly vmId: number;
	public readonly statusCode: number;

	constructor(vmId: number, message?: string) {
		super(`VM ${vmId} does not exist on this node`);
		this.name = "VMNotFoundError";
		this.vmId = vmId;
		this.statusCode = 500;
		Object.setPrototypeOf(this, VMNotFoundError.prototype);
	}
}
