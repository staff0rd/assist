import type { TranscriptEvent } from "./TranscriptEvent";

type RawEntry = Record<string, unknown>;

const INTERRUPT_PREFIX = "[Request interrupted";

export function normalizeUser(entry: RawEntry): TranscriptEvent {
	const content = asRecord(entry.message)?.content;
	if (typeof content === "string")
		return isInterruptText(content) ? { kind: "interrupt" } : { kind: "user" };
	if (!Array.isArray(content)) return { kind: "user" };

	const toolResultIds: string[] = [];
	let hasInterrupt = false;
	let hasNonToolResult = false;
	for (const block of content) {
		const b = asRecord(block);
		if (!b) continue;
		if (b.type === "tool_result") {
			if (typeof b.tool_use_id === "string") toolResultIds.push(b.tool_use_id);
		} else if (b.type === "text" && isInterruptText(b.text)) {
			hasInterrupt = true;
		} else {
			hasNonToolResult = true;
		}
	}
	if (hasInterrupt) return { kind: "interrupt" };
	if (hasNonToolResult) return { kind: "user" };
	return { kind: "toolResult", ids: toolResultIds };
}

function asRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: null;
}

function isInterruptText(value: unknown): boolean {
	return typeof value === "string" && value.startsWith(INTERRUPT_PREFIX);
}
