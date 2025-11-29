export class VMPermissionError extends Error {
	public readonly vmId: number;
	public readonly statusCode: number;

	constructor(vmId: number, message?: string) {
		const baseMessage = `Permission denied: You don't have the required permissions to access VM ${vmId}`;
		super(message ? `${baseMessage}. ${message}` : baseMessage);
		this.name = "VMPermissionError";
		this.vmId = vmId;
		this.statusCode = 403;
		Object.setPrototypeOf(this, VMPermissionError.prototype);
	}
}

