import { resolveCodexSessionId } from "../shared/codex/resolveCodexSessionId";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { rememberSessionTitle } from "./rememberSessionTitle";

const POLL_MS = 1000;
const MAX_ATTEMPTS = 120;
const START_SLACK_MS = 5000;

const latestBind = new WeakMap<Session, number>();

export function bindCodexSession(
	session: Session,
	notify: () => void,
	launchedAt: number = session.startedAt,
): void {
	const cwd = session.cwd;
	if (session.harness !== "codex" || !cwd || session.harnessSessionId) return;

	const bind = (latestBind.get(session) ?? 0) + 1;
	latestBind.set(session, bind);
	const superseded = () =>
		!!session.harnessSessionId || latestBind.get(session) !== bind;
	const since = launchedAt - START_SLACK_MS;
	let attemptsLeft = MAX_ATTEMPTS;

	const schedule = () => setTimeout(() => void poll(), POLL_MS).unref();
	const poll = async () => {
		if (superseded()) return;
		const sessionId = await resolveCodexSessionId(cwd, since);
		if (superseded()) return;
		if (!sessionId) {
			if (--attemptsLeft > 0) schedule();
			return;
		}
		session.harnessSessionId = sessionId;
		daemonLog(`session ${session.id} bound to codex conversation ${sessionId}`);
		rememberSessionTitle(session);
		notify();
	};

	schedule();
}
