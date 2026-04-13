const IDLE_MS = 3_000;

type IdleSession = {
	status: string;
	idleTimer: ReturnType<typeof setTimeout> | null;
};

export function scheduleIdle(session: IdleSession, onIdle: () => void): void {
	if (session.idleTimer) clearTimeout(session.idleTimer);
	if (session.status === "done") return;
	session.idleTimer = setTimeout(() => {
		if (session.status === "running") onIdle();
	}, IDLE_MS);
}

export function clearIdle(session: IdleSession): void {
	if (session.idleTimer) clearTimeout(session.idleTimer);
}
