export type TransferSnapshot = {
	ref: string;
	branch?: string;
	upstream?: string;
};

export function transferRefFor(key: string): string {
	return `assist/transfer/${key}`;
}

export function promptTransferKey(node: string, sessionId: string): string {
	return `${node}-${sessionId}`;
}

export function parseTransferSnapshot(
	value: unknown,
): TransferSnapshot | undefined {
	if (!value || typeof value !== "object") return undefined;
	const { ref, branch, upstream } = value as Record<string, unknown>;
	if (typeof ref !== "string" || !ref.startsWith("assist/transfer/"))
		return undefined;
	return {
		ref,
		branch: typeof branch === "string" ? branch : undefined,
		upstream: typeof upstream === "string" ? upstream : undefined,
	};
}
