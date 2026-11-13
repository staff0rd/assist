import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { killPtyTree } from "./killPtyTree";
import { respawnSession } from "./respawnSession";
import { spawnAssistProcess } from "./spawnAssistProcess";
import { spawnRun } from "./spawnRun";
import type { OnStatusChange } from "./types";

export function retrySession(
	session: Session,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): boolean {
	const spawn = respawnThunk(session);
	if (!spawn) return false;
	const respawn = () => {
		respawnSession(session, spawn, "running", clients, onStatusChange);
		daemonLog(`session ${session.id} retried: ${session.name}`);
	};

	const pty = session.pty;
	const alive = session.status === "running" || session.status === "waiting";
	if (pty && alive) {
		daemonLog(
			`session ${session.id} retry requested: killing running process tree, will respawn on exit`,
		);
		session.pendingRestart = respawn;
		killPtyTree(pty);
	} else {
		respawn();
	}
	return true;
}

function respawnThunk(session: Session): (() => Session["pty"]) | null {
	const { runName, runArgs, assistArgs, cwd } = session;
	if (session.commandType === "run" && runName)
		return () => spawnRun({ name: runName, args: runArgs, cwd });
	if (session.commandType === "assist" && assistArgs)
		return () => spawnAssistProcess(["assist", ...assistArgs], cwd, session.id);
	return null;
}
