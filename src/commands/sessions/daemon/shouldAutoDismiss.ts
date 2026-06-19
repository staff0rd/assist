import type { Session } from "./createSession";

export function shouldAutoDismiss(
	session: Session,
	exitCode?: number,
): boolean {
	const args = session.assistArgs;
	if (session.status !== "done" || exitCode !== 0 || args === undefined) {
		return false;
	}
	if (args[0] === "update") return true;
	return args.includes("--once") && args[0] !== "next";
}
