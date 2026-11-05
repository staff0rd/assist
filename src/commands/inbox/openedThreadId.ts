const BODILESS_FORMATS = new Set(["MINIMAL", "METADATA_ONLY"]);

export function openedThreadId(input: unknown): string | undefined {
	const { threadId, messageFormat } = (input ?? {}) as Record<string, unknown>;
	if (typeof threadId !== "string") return undefined;
	return typeof messageFormat === "string" &&
		BODILESS_FORMATS.has(messageFormat)
		? undefined
		: threadId;
}
