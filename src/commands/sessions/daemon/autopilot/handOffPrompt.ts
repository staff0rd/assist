import { autopilotRunContract } from "../../../backlog/autopilotRunContract";

/** Autopilot's prompt to a run member holding the run open on a background wait past a tick. */
export function handOffPrompt(
	nextTickAt: string,
	item: string | undefined,
	taskAge: string,
): string {
	return [
		`Autopilot skipped its scheduled tick because this session is holding the run open while it waits on a background task (running ${taskAge}).`,
		autopilotRunContract(nextTickAt, item ?? "<item>"),
		"Stop waiting now: stop the background task, record the pending check in an item comment for the next tick, then finish the item and end. If this session still holds the run at the next tick, autopilot pauses.",
	].join("\n\n");
}
