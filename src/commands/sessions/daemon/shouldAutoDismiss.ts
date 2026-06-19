import type { Session } from "./createSession";

export function shouldAutoDismiss(
	session: Session,
	exitCode?: number,
): boolean {
	if (session.status !== "done" || exitCode !== 0) {
		return false;
	}
	/* why: a backlog run that reached its review phase (#409) dismisses only if
	 * "Continue" is left/switched on (autoAdvance); left off, it stays at "done". */
	if (session.reviewStarted) {
		return session.autoAdvance === true;
	}
	const args = session.assistArgs;
	if (args === undefined) return false;
	if (args[0] === "update") return true;
	return args.includes("--once") && args[0] !== "next";
}
