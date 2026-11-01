import type { Session } from "./createSession";

export function shouldAutoDismiss(
	session: Session,
	exitCode?: number,
): boolean {
	if (session.status !== "done" || exitCode !== 0 || session.transfer) {
		return false;
	}
	/* why: a backlog run that reached its review phase (#409) dismisses on a
	 * clean exit whether "Continue" (autoAdvance) is on or off. */
	if (session.reviewStarted) return true;
	if (session.activity?.kind === "backlog" && session.autoAdvance === false)
		return true;
	const args = session.assistArgs;
	if (args === undefined) return false;
	if (args[0] === "update") return true;
	return args.includes("--once") && args[0] !== "next";
}
