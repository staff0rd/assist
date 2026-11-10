export class CodexRpcError extends Error {
	constructor(
		readonly method: string,
		readonly code: number,
		message: string,
	) {
		super(`${method}: ${message}`);
		this.name = "CodexRpcError";
	}
}
