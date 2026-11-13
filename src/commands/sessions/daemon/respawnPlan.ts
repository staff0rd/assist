import { assistResumeArgs } from "./assistResumeArgs";
import {
	conversationResumeOutcome,
	type ResumeOutcome,
} from "./conversationResumeOutcome";
import type { Session } from "./createSession";
import {
	interactiveRespawnPlan,
	type RespawnPlan,
} from "./interactiveRespawnPlan";
import { spawnPty } from "./spawnPty";

export function respawnPlan(
	session: Session,
	fresh = false,
): RespawnPlan | null {
	const { commandType, cwd, assistArgs } = session;
	if (commandType === "claude") return interactiveRespawnPlan(session, fresh);
	if (commandType === "assist" && assistArgs) {
		const idle = !fresh && session.status === "waiting";
		let resume: ResumeOutcome | undefined;
		return {
			spawn: () => {
				if (fresh) {
					session.claudeSessionId = undefined;
					session.harnessSessionId = undefined;
				}
				resume = fresh ? undefined : conversationResumeOutcome(session);
				return spawnPty(
					assistResumeArgs({ assistArgs, resumeSessionId: resume?.id }),
					cwd,
					session.id,
					idle ? { ASSIST_RESUME_IDLE: "1" } : undefined,
				);
			},
			status: idle ? "waiting" : "running",
			resumeOutcome: () => resume,
		};
	}
	return null;
}
