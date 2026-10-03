import type { ToolUse, TranscriptEvent } from "./TranscriptEvent";

const ASK_USER_QUESTION = "AskUserQuestion";

export function hasPendingAskUserQuestion(
	events: TranscriptEvent[],
	idx: number,
): boolean {
	const ev = events[idx];
	if (ev?.kind !== "assistant") return false;
	const resolved = resolvedToolUseIds(events, idx);
	return ev.toolUses.some(
		(tool: ToolUse) =>
			tool.name === ASK_USER_QUESTION && !resolved.has(tool.id),
	);
}

function resolvedToolUseIds(
	events: TranscriptEvent[],
	afterIdx: number,
): Set<string> {
	const ids = new Set<string>();
	for (let i = afterIdx + 1; i < events.length; i++) {
		const event = events[i];
		if (event.kind === "toolResult") for (const id of event.ids) ids.add(id);
	}
	return ids;
}
