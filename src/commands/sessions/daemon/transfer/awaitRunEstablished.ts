import type { Session } from "../createSession";

const POLL_MS = 250;
const START_CAP_MS = 240_000;
const STARTUP_GRACE_MS = 15_000;

type RunEstablished =
	| { ok: true; reason: string }
	| { ok: false; error: string };

type Timing = { pollMs?: number; startCapMs?: number; graceMs?: number };

function started(s: Session): boolean {
	return !s.pendingStart && !s.awaitingSeed && s.pty !== null;
}

export function awaitRunEstablished(
	sessions: Map<string, Session>,
	id: string,
	{
		pollMs = POLL_MS,
		startCapMs = START_CAP_MS,
		graceMs = STARTUP_GRACE_MS,
	}: Timing = {},
): Promise<RunEstablished> {
	const begun = Date.now();
	let startedAt: number | undefined;
	return new Promise((resolve) => {
		const check = () => {
			const s = sessions.get(id);
			if (!s) return resolve({ ok: false, error: "target session vanished" });
			if (s.status === "error")
				return resolve({ ok: false, error: s.error ?? "run errored" });
			if (s.status === "done")
				return resolve({ ok: true, reason: "run finished" });
			const now = Date.now();
			if (startedAt === undefined && started(s)) startedAt = now;
			if (startedAt !== undefined && now - startedAt >= graceMs)
				return resolve({ ok: true, reason: "survived startup" });
			if (startedAt === undefined && now - begun >= startCapMs)
				return resolve({ ok: true, reason: "still seeding at cap" });
			setTimeout(check, pollMs);
		};
		check();
	});
}
