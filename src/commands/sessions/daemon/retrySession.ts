import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { respawnSession } from "./respawnSession";
import { spawnPty } from "./spawnPty";
import { spawnRun } from "./spawnRun";
import type { OnStatusChange } from "./types";

export function retrySession(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): boolean {
	const respawn = respawnThunk(session);
	if (!respawn) return false;
	if (session.status !== "done") session.pty?.kill();
	respawnSession(session, respawn, "running", clients, onStatusChange);
	daemonLog(`session ${session.id} retried: ${session.name}`);
	return true;
}

function respawnThunk(session: Session): (() => Session["pty"]) | null {
	const { runName, runArgs, assistArgs, cwd } = session;
	if (session.commandType === "run" && runName)
		return () => spawnRun({ name: runName, args: runArgs, cwd });
	if (session.commandType === "assist" && assistArgs)
		return () => spawnPty(["assist", ...assistArgs], cwd, session.id);
	return null;
}
