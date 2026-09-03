export type SessionInterruption = { reason: string; at: number };

const DAEMON_RESTART = "daemon-restart";

export function daemonRestartInterruption(): SessionInterruption {
	return { reason: DAEMON_RESTART, at: Date.now() };
}

export function killedByDaemonRestart(
	interrupted: SessionInterruption | undefined,
): boolean {
	return interrupted?.reason === DAEMON_RESTART;
}
