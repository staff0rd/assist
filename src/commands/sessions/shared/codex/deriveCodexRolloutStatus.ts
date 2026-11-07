import { rolloutPayload } from "./parseRolloutEntry";

const TURN_END_EVENTS = new Set(["task_complete", "turn_aborted"]);

type TurnEvent = "started" | "ended" | null;

function turnEvent(entry: Record<string, unknown>): TurnEvent {
	if (entry.type !== "event_msg") return null;
	const kind = rolloutPayload(entry).type;
	if (kind === "task_started") return "started";
	return typeof kind === "string" && TURN_END_EVENTS.has(kind) ? "ended" : null;
}

function hasAgentActivity(entries: Record<string, unknown>[]): boolean {
	return entries.some((entry) => entry.type === "response_item");
}

export function deriveCodexRolloutStatus(
	entries: Record<string, unknown>[],
): "running" | "waiting" {
	for (let i = entries.length - 1; i >= 0; i--) {
		const event = turnEvent(entries[i]);
		if (event) return event === "started" ? "running" : "waiting";
	}
	return hasAgentActivity(entries) ? "running" : "waiting";
}
