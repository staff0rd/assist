import { formatItemId } from "../../../backlog/formatItemId";
import { daemonLog } from "../daemonLog";
import type { AutopilotHeldMember } from "./AutopilotDeps";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { formatTaskAge } from "./formatTaskAge";
import { handOffPrompt } from "./handOffPrompt";
import { pauseHeldMember } from "./pauseHeldMember";

/** Prompt each held member to hand its check to the tick at nextTickAt, counting it with the nudges; pauses if one can't take it. */
export function sendHandOffs(
	store: AutopilotStore,
	started: AutopilotStarted,
	cwd: string,
	held: AutopilotHeldMember[],
	nextTickAt: string,
): void {
	for (const member of held) {
		const age = formatTaskAge(member.taskAgeMs);
		const seen = started.nudges.get(member.sessionId);
		started.nudges.set(member.sessionId, {
			waitingSince: seen?.waitingSince ?? 0,
			count: (seen?.count ?? 0) + 1,
			handedOff: true,
		});
		const item =
			member.itemId === undefined ? undefined : formatItemId(member.itemId);
		if (
			!started.deps.promptSession(
				member.sessionId,
				handOffPrompt(nextTickAt, item, age),
			)
		) {
			pauseHeldMember(
				store,
				started,
				cwd,
				member,
				`its session holds the run open on a background task (running ${age}) and could not take autopilot's hand-off prompt`,
			);
			return;
		}
		daemonLog(
			`autopilot: ${cwd} tick held by ${member.sessionId} on a background task (age ${age}); sent hand-off for the tick at ${nextTickAt}`,
		);
	}
}
