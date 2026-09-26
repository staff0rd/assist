import { normalizeTranscriptEvents } from "./normalizeTranscriptEvents";
import type { ToolUse, TranscriptEvent } from "./TranscriptEvent";

const ASK_USER_QUESTION = "AskUserQuestion";
const TURN_END_STOP_REASONS = new Set(["end_turn", "stop_sequence"]);
const NON_DECISIVE_KINDS = new Set<TranscriptEvent["kind"]>([
	"toolResult",
	"taskNotification",
]);

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
	if (ev.kind === "toolResult" || ev.kind === "taskNotification") return null;

	if (ev.stopReason != null && TURN_END_STOP_REASONS.has(ev.stopReason))
		return "waiting";

	if (opts.permissionActive) return "waiting";

	const resolved = resolvedToolUseIds(events, lastIdx);
	const pending = ev.toolUses.filter((tool: ToolUse) => !resolved.has(tool.id));
	if (pending.some((tool: ToolUse) => tool.name === ASK_USER_QUESTION))
		return "waiting";
	return "running";
}

function lastDecisiveIndex(events: TranscriptEvent[]): number {
	for (let i = events.length - 1; i >= 0; i--)
		if (!NON_DECISIVE_KINDS.has(events[i].kind)) return i;
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
