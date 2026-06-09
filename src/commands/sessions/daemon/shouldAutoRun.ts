import type { Session } from "./createSession";

export function shouldAutoRun(session: Session, exitCode?: number): boolean {
	if (!session.autoRun) return false;
	if (session.status !== "done" || exitCode !== 0) return false;
	if (session.commandType !== "assist") return false;
	const cmd = session.assistArgs?.[0];
	if (cmd !== "draft" && cmd !== "bug") return false;
	return session.activity?.itemId != null;
}
