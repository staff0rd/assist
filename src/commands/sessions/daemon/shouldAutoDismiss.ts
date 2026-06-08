import type { Session } from "./createSession";

export function shouldAutoDismiss(
	session: Session,
	exitCode?: number,
): boolean {
	const args = session.assistArgs;
	return (
		session.status === "done" &&
		exitCode === 0 &&
		args !== undefined &&
		args.includes("--once") &&
		args[0] !== "next"
	);
}
