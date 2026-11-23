import chalk from "chalk";
import { requestDaemonReply } from "../../sessions/daemon/requestDaemonReply";
import { deferredRunEnv } from "../../sessions/shared/deferredRunEnv";
import type { ProposedItem } from "./proposedItemSchema";

export async function refuseMissingSummary(
	item: ProposedItem,
	sessionId: string | undefined,
): Promise<boolean> {
	/* why: the daemon's deferred re-run was already checked before deferring. */
	if (!sessionId || item.summary || process.env[deferredRunEnv] === "1")
		return false;
	const reply = await requestDaemonReply<{ autopilot: boolean }>(
		{ type: "autopilot-session", sessionId },
		"autopilot-session",
	);
	if (!reply?.autopilot) return false;
	console.error(
		chalk.red(
			'Error: an autopilot session must give a one-line "summary" in the propose payload: the constraint the item addresses and its predicted effect (e.g. "Constraint: 4 haulers idle 6 h. Adds AGENT-9. Predicts +3.1k credits/h."). It is shown as the item\'s why line on the Autopilot page. Add it and re-run propose.',
		),
	);
	process.exitCode = 1;
	return true;
}
