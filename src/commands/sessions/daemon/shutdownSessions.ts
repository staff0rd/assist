import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { persistLiveSessions } from "./loadPersistedSessions";
import { daemonRestartInterruption } from "./SessionInterruption";

export function shutdownSessions(sessions: Map<string, Session>): void {
	const doomed = [...sessions.values()].filter((s) => s.status !== "done");
	daemonLog(
		`shutting down: killing ${doomed.length} session(s): ${describeAll(doomed)}`,
	);
	for (const session of doomed)
		session.interrupted = daemonRestartInterruption();
	recordInterruptions(sessions);
	let failures = 0;
	for (const session of doomed) {
		try {
			session.pty?.kill();
		} catch (error) {
			failures++;
			const reason = error instanceof Error ? error.message : String(error);
			daemonLog(
				`shutting down: killing session ${session.name} (${session.id}) failed: ${reason}`,
			);
		}
	}
	if (failures > 0)
		daemonLog(
			`shutting down: ${failures} session(s) failed to die; continuing so the process still exits and releases its listeners`,
		);
}

function describeAll(doomed: Session[]): string {
	return doomed.length === 0
		? "none"
		: doomed.map((s) => `${s.name} (${s.id})`).join(", ");
}

function recordInterruptions(sessions: Map<string, Session>): void {
	try {
		persistLiveSessions(sessions);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(
			`shutting down: could not record the restart against the sessions (${reason}); they will resume without knowing why they stopped`,
		);
	}
}
