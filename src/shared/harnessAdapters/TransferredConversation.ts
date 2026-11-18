export type TransferredConversation = {
	id: string;
	transcript: string;
	path?: string[];
};

const SAFE_SEGMENT = /^[\w.-]+$/;

function parsePath(value: unknown): string[] | undefined | false {
	if (value === undefined) return undefined;
	if (!Array.isArray(value) || value.length === 0) return false;
	const safe = value.every(
		(part) =>
			typeof part === "string" &&
			SAFE_SEGMENT.test(part) &&
			part !== "." &&
			part !== "..",
	);
	return safe ? (value as string[]) : false;
}

export function parseTransferredConversation(
	value: unknown,
): TransferredConversation | undefined {
	if (!value || typeof value !== "object") return undefined;
	const { id, transcript, path } = value as Record<string, unknown>;
	if (typeof id !== "string" || !id || typeof transcript !== "string")
		return undefined;
	const parsedPath = parsePath(path);
	if (parsedPath === false) return undefined;
	return parsedPath ? { id, transcript, path: parsedPath } : { id, transcript };
}
