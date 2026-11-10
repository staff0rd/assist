import { CodexRpcError } from "./CodexRpcError";

export type PendingCodexCall = {
	method: string;
	resolve: (value: unknown) => void;
	reject: (e: Error) => void;
};

export function routeCodexRpcLine(
	line: string,
	pending: Map<number, PendingCodexCall>,
): void {
	let message: {
		id?: unknown;
		result?: unknown;
		error?: { code: number; message: string };
	};
	try {
		message = JSON.parse(line);
	} catch {
		return;
	}
	if (typeof message.id !== "number") return;
	const entry = pending.get(message.id);
	if (!entry) return;
	pending.delete(message.id);
	if (message.error)
		entry.reject(
			new CodexRpcError(
				entry.method,
				message.error.code,
				message.error.message,
			),
		);
	else entry.resolve(message.result);
}
