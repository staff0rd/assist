export class PushFailedError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PushFailedError";
	}
}
