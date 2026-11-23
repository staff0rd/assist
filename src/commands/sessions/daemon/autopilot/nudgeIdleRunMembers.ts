import { formatItemId } from "../../../backlog/formatItemId";
import { daemonLog } from "../daemonLog";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { idleMemberPrompt } from "./idleMemberPrompt";
import { pauseOnFailure } from "./pauseOnFailure";
import { stuckReason } from "./stuckReason";

/* why: a turn can end briefly between tool-driven continuations, so only a
 * session idle this long is treated as waiting on a chat reply. */
const IDLE_GRACE_MS = 2 * 60_000;
const MAX_NUDGES = 2;

/** Answer run sessions idle on a chat question; pause once answering stops helping. */
export function nudgeIdleRunMembers(
	store: AutopilotStore,
	started: AutopilotStarted,
	cwd: string,
): void {
	const repo = store.repo(cwd);
	if (!repo.current || repo.paused) return;
	const now = Date.now();
	for (const member of started.deps.idleMembers?.(repo.current.sessionId) ??
		[]) {
		if (now - member.waitingSince < IDLE_GRACE_MS) continue;
		const seen = started.nudges.get(member.sessionId);
		if (seen?.waitingSince === member.waitingSince) continue;
		const count = seen?.count ?? 0;
		const sent =
			count < MAX_NUDGES &&
			started.deps.promptSession(member.sessionId, idleMemberPrompt());
		started.nudges.set(member.sessionId, {
			waitingSince: member.waitingSince,
			count: count + 1,
		});
		if (sent) {
			daemonLog(
				`autopilot: ${cwd} answered idle session ${member.sessionId} (${count + 1}/${MAX_NUDGES})`,
			);
			continue;
		}
		pauseOnFailure(store, started.deps, cwd, {
			item:
				member.itemId === undefined ? undefined : formatItemId(member.itemId),
			phase: member.phase,
			sessionId: member.sessionId,
			reason: stuckReason(member),
		});
		return;
	}
}
