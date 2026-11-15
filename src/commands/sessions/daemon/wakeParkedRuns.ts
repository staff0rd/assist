import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { isRunPhaseSession } from "./isBacklogRunSession";
import { refuseSpawn } from "./refuseSpawn";
import { setStatus } from "./setStatus";
import { spawnAssistProcess } from "./spawnAssistProcess";
import type { OnStatusChange } from "./types";
import { wirePtyEvents } from "./wirePtyEvents";

function isAlive(session: Session): boolean {
	return (
		session.pty !== null ||
		session.status === "running" ||
		session.status === "waiting" ||
		session.pendingStart !== undefined
	);
}

function livePhases(sessions: Map<string, Session>, run: Session): Session[] {
	return [...sessions.values()].filter(
		(s) => s.launchedFrom === run.id && isRunPhaseSession(s) && isAlive(s),
	);
}

/** Restart every parked backlog run none of whose phase sessions are still alive, so it picks up where its phases left off. */
export function wakeParkedRuns(
	sessions: Map<string, Session>,
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): void {
	for (const run of sessions.values()) {
		if (run.status !== "parked" || !run.assistArgs) continue;
		if (livePhases(sessions, run).length > 0) continue;
		wakeRun(run, run.assistArgs, clients, onStatusChange);
	}
}

function wakeRun(
	run: Session,
	assistArgs: string[],
	clients: Set<SessionClient>,
	onStatusChange: OnStatusChange,
): void {
	daemonLog(
		`session ${run.id} ("${run.name}") waking: none of its phase sessions are alive`,
	);
	setStatus(run, "running");
	run.restored = undefined;
	run.error = undefined;
	try {
		run.pty = spawnAssistProcess(["assist", ...assistArgs], run.cwd, run.id, {
			ASSIST_BACKLOG_WAKE: "1",
		});
	} catch (error) {
		refuseSpawn(run, error, clients, onStatusChange, "woken");
		return;
	}
	if (run.cols && run.rows)
		try {
			run.pty?.resize(run.cols, run.rows);
		} catch {}
	wirePtyEvents(run, clients, onStatusChange);
}
