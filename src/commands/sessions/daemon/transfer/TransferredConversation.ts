export type TransferredConversation = { id: string; transcript: string };

export function parseTransferredConversation(
	value: unknown,
): TransferredConversation | undefined {
	if (!value || typeof value !== "object") return undefined;
	const { id, transcript } = value as Record<string, unknown>;
	if (typeof id !== "string" || !id || typeof transcript !== "string")
		return undefined;
	return { id, transcript };
}
