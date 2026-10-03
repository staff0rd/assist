import { hasPendingAskUserQuestion } from "./hasPendingAskUserQuestion";
import { lastDecisiveIndex } from "./lastDecisiveIndex";
import { normalizeTranscriptEvents } from "./normalizeTranscriptEvents";

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
	if (ev.kind === "toolResult" || ev.kind === "taskNotification") return null;

	if (ev.stopReason != null && TURN_END_STOP_REASONS.has(ev.stopReason))
		return "waiting";

	if (opts.permissionActive) return "waiting";

	if (hasPendingAskUserQuestion(events, lastIdx)) return "waiting";
	return "running";
}
