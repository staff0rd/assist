import type { Session, SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";

type OnStatusChange = (session: Session, status: SessionStatus) => void;

/* why: running/waiting is pushed by Claude Code hooks, but an extended-thinking
 * phase emits PTY output while firing no hook, so a card last set to waiting
 * (after a Stop/Notification) stays waiting for the whole thinking phase and
 * only flips to running once the first tool call triggers PreToolUse (#447). We
 * treat sustained PTY output during waiting as proof the agent is actively
 * working and flip it to running ourselves. "Sustained" is the safeguard: a
 * lone render burst — a permission prompt or Notification redraw — arrives as
 * one short flurry that never spans ACTIVATE_MS, so it is not mistaken for
 * activity, while a thinking stream emits continuously across seconds. */
const ACTIVATE_MS = 500;
/* A pause longer than this ends the current output streak; the next output
 * starts a fresh one rather than combining with stale, pre-pause bursts. */
const GAP_MS = 1_000;

export function noteOutputForThinking(
	session: Session,
	onStatusChange: OnStatusChange,
): void {
	if (session.status !== "waiting") {
		session.thinkingStreakStart = undefined;
		session.thinkingLastOutput = undefined;
		return;
	}
	const now = Date.now();
	const stale =
		session.thinkingStreakStart == null ||
		session.thinkingLastOutput == null ||
		now - session.thinkingLastOutput > GAP_MS;
	if (stale) session.thinkingStreakStart = now;
	session.thinkingLastOutput = now;
	if (now - (session.thinkingStreakStart ?? now) < ACTIVATE_MS) return;
	session.thinkingStreakStart = undefined;
	session.thinkingLastOutput = undefined;
	daemonLog(`session ${session.id} sustained output while waiting -> running`);
	onStatusChange(session, "running");
}
