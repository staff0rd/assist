import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

type RespawnPlan = { spawn: () => Session["pty"]; status: Session["status"] };

export function respawnPlan(session: Session): RespawnPlan | null {
	const { commandType, claudeSessionId, cwd, assistArgs } = session;
	if (commandType === "claude")
		return claudeSessionId
			? {
					spawn: () =>
						spawnClaude({
							resumeSessionId: claudeSessionId,
							cwd,
							sessionId: session.id,
						}),
					status: "waiting",
				}
			: null;
	if (commandType === "assist" && assistArgs) {
		const idle = session.status === "waiting";
		return {
			spawn: () =>
				spawnPty(
					assistResumeArgs({ assistArgs, claudeSessionId }),
					cwd,
					session.id,
					idle ? { ASSIST_RESUME_IDLE: "1" } : undefined,
				),
			status: idle ? "waiting" : "running",
		};
	}
	return null;
}
