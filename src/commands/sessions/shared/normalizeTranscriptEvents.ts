import { normalizeUser } from "./normalizeUser";
import type { ToolUse, TranscriptEvent } from "./TranscriptEvent";

type RawEntry = Record<string, unknown>;

export function normalizeTranscriptEvents(
	entries: RawEntry[],
): TranscriptEvent[] {
	return entries
		.map(normalizeEntry)
		.filter((event): event is TranscriptEvent => event !== null);
}

function normalizeEntry(entry: RawEntry): TranscriptEvent | null {
	if (entry.isSidechain || entry.isMeta) return null;
	if (entry.type === "assistant") return normalizeAssistant(entry);
	if (entry.type === "user") return normalizeUser(entry);
	return null;
}

function normalizeAssistant(entry: RawEntry): TranscriptEvent {
	const message = asRecord(entry.message);
	const stopReason =
		typeof message?.stop_reason === "string" ? message.stop_reason : null;
	const content = message?.content;
	const toolUses: ToolUse[] = [];
	if (Array.isArray(content))
		for (const block of content) {
			const b = asRecord(block);
			if (b?.type === "tool_use")
				toolUses.push({
					id: typeof b.id === "string" ? b.id : "",
					name: typeof b.name === "string" ? b.name : "",
				});
		}
	return { kind: "assistant", stopReason, toolUses };
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: null;
}
