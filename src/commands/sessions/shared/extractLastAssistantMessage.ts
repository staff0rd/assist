const MAX_LENGTH = 500;

type RawEntry = Record<string, unknown>;

export function extractLastAssistantMessage(
	entries: RawEntry[],
): string | undefined {
	for (let i = entries.length - 1; i >= 0; i--) {
		const entry = entries[i];
		if (entry.isSidechain || entry.type !== "assistant") continue;
		const text = assistantText(entry);
		if (text) return cap(text);
	}
	return undefined;
}

function assistantText(entry: RawEntry): string {
	const content = asRecord(entry.message)?.content;
	if (!Array.isArray(content)) return "";
	const parts: string[] = [];
	for (const block of content) {
		const b = asRecord(block);
		if (b?.type === "text" && typeof b.text === "string" && b.text.trim())
			parts.push(b.text.trim());
	}
	return parts.join("\n");
}

function cap(text: string): string {
	return text.length <= MAX_LENGTH
		? text
		: `${text.slice(0, MAX_LENGTH).trimEnd()}…`;
}

function asRecord(value: unknown): RawEntry | null {
	return value && typeof value === "object" ? (value as RawEntry) : null;
}
