import { randomUUID } from "node:crypto";
import { assistResumeArgs } from "./assistResumeArgs";
import type { Session } from "./createSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

type RespawnPlan = { spawn: () => Session["pty"]; status: Session["status"] };

export function respawnPlan(session: Session): RespawnPlan | null {
	const { commandType, claudeSessionId, cwd, assistArgs, initialPrompt } =
		session;
	if (commandType === "claude") {
		if (claudeSessionId)
			return {
				spawn: () =>
					spawnClaude({
						resumeSessionId: claudeSessionId,
						cwd,
						sessionId: session.id,
					}),
				status: "waiting",
			};
		if (initialPrompt) return freshClaudePlan(session, initialPrompt, cwd);
		return null;
	}
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

function freshClaudePlan(
	session: Session,
	prompt: string,
	cwd: string | undefined,
): RespawnPlan {
	const claudeSessionId = randomUUID();
	return {
		spawn: () => {
			session.claudeSessionId = claudeSessionId;
			return spawnClaude({
				prompt,
				cwd,
				sessionId: session.id,
				claudeSessionId,
			});
		},
		status: "running",
	};
}
