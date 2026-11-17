import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

const RETRY_MS = 1000;
const MAX_ATTEMPTS = 120;

type PendingRetry = {
	key: string;
	attempts: number;
	timer: ReturnType<typeof setTimeout>;
};

const pending = new WeakMap<Session, PendingRetry>();

export function retryTranscriptWatch(
	session: Session,
	conversationKey: string,
	retry: () => void,
): void {
	const previous = pending.get(session);
	if (previous) clearTimeout(previous.timer);
	const attempts =
		previous?.key === conversationKey ? previous.attempts + 1 : 1;
	if (attempts > MAX_ATTEMPTS) {
		pending.delete(session);
		daemonLog(
			`session ${session.id} transcript for ${conversationKey} never appeared; not watching`,
		);
		return;
	}
	if (attempts === 1)
		daemonLog(
			`session ${session.id} transcript for ${conversationKey} not found yet; retrying`,
		);
	const timer = setTimeout(retry, RETRY_MS);
	timer.unref?.();
	pending.set(session, { key: conversationKey, attempts, timer });
}

export function cancelTranscriptWatchRetry(session: Session): void {
	const previous = pending.get(session);
	if (previous) clearTimeout(previous.timer);
	pending.delete(session);
}
