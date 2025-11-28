export class VMNotFoundError extends Error {
	public readonly vmId: number;
	public readonly statusCode: number;

	constructor(vmId: number, message?: string) {
		super(message || `VM ${vmId} does not exist`);
		this.name = "VMNotFoundError";
		this.vmId = vmId;
		this.statusCode = 403;
		Object.setPrototypeOf(this, VMNotFoundError.prototype);
	}
}
