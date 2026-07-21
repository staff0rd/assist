import { normalizeTranscriptEvents } from "./normalizeTranscriptEvents";
import type { ToolUse, TranscriptEvent } from "./TranscriptEvent";

const ASK_USER_QUESTION = "AskUserQuestion";
const TURN_END_STOP_REASONS = new Set(["end_turn", "stop_sequence"]);

export function deriveTranscriptStatus(
	entries: Record<string, unknown>[],
	opts: { permissionActive?: boolean } = {},
): "running" | "waiting" | null {
	const events = normalizeTranscriptEvents(entries);
	const lastIdx = lastDecisiveIndex(events);
	if (lastIdx === -1) return null;

	const ev = events[lastIdx];
	if (ev.kind === "interrupt") return "waiting";
	if (ev.kind === "user") return "running";
	if (ev.kind === "toolResult") return null;

	if (ev.stopReason != null && TURN_END_STOP_REASONS.has(ev.stopReason))
		return "waiting";

	const resolved = resolvedToolUseIds(events, lastIdx);
	const pending = ev.toolUses.filter((tool: ToolUse) => !resolved.has(tool.id));
	if (pending.length === 0) return "running";
	if (pending.some((tool: ToolUse) => tool.name === ASK_USER_QUESTION))
		return "waiting";
	if (opts.permissionActive) return "waiting";
	return "running";
}

function lastDecisiveIndex(events: TranscriptEvent[]): number {
	for (let i = events.length - 1; i >= 0; i--)
		if (events[i].kind !== "toolResult") return i;
	return -1;
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
