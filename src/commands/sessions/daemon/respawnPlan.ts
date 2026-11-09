import { assistResumeArgs } from "./assistResumeArgs";
import { conversationResumeOutcome } from "./conversationResumeOutcome";
import type { Session } from "./createSession";
import { interactiveHarnessRespawn } from "./interactiveHarnessRespawn";
import type { RespawnPlan } from "./interactiveRespawnPlan";
import { spawnPty } from "./spawnPty";

export function respawnPlan(session: Session): RespawnPlan | null {
	const { commandType, cwd, assistArgs } = session;
	if (commandType === "claude") return interactiveHarnessRespawn(session);
	if (commandType === "assist" && assistArgs) {
		const idle = session.status === "waiting";
		let via = "fresh";
		return {
			spawn: () => {
				const resume = conversationResumeOutcome(session);
				via = resume.id ? `resume ${resume.id}` : `fresh: ${resume.reason}`;
				return spawnPty(
					assistResumeArgs({ assistArgs, resumeSessionId: resume.id }),
					cwd,
					session.id,
					idle ? { ASSIST_RESUME_IDLE: "1" } : undefined,
				);
			},
			status: idle ? "waiting" : "running",
			via: () => via,
		};
	}
	return null;
}
