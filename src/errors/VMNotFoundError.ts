export class VMNotFoundError extends Error {
	public readonly vmId: number;
	public readonly statusCode: number;

	constructor(vmId: number, message?: string) {
		const baseMessage = `VM ${vmId} does not exist on this node`;
		super(message ? `${baseMessage}. ${message}` : baseMessage);
		this.name = "VMNotFoundError";
		this.vmId = vmId;
		this.statusCode = 500;
		Object.setPrototypeOf(this, VMNotFoundError.prototype);
	}
}
