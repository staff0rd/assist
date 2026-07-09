import { assistResumeArgs } from "./assistResumeArgs";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { type OnStatusChange, respawnSession } from "./respawnSession";
import { spawnClaude } from "./spawnClaude";
import { spawnPty } from "./spawnPty";

type RespawnPlan = { spawn: () => Session["pty"]; status: Session["status"] };

export function restartSession(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): boolean {
	const plan = respawnPlan(session);
	if (!plan) return false;
	session.pty?.kill();
	respawnSession(session, plan.spawn, plan.status, clients, onStatusChange);
	const via = session.claudeSessionId
		? `resume ${session.claudeSessionId}`
		: "fresh";
	daemonLog(`session ${session.id} restarted (${via}): ${session.name}`);
	return true;
}

function respawnPlan(session: Session): RespawnPlan | null {
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
