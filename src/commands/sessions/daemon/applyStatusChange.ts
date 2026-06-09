import type { Session } from "./createSession";
import { shouldAutoDismiss } from "./shouldAutoDismiss";
import { shouldAutoRun } from "./shouldAutoRun";

export function applyStatusChange(
	session: Session,
	status: Session["status"],
	exitCode: number | undefined,
	dismiss: (id: string) => void,
	notify: () => void,
	spawnRun: (itemId: number, cwd?: string) => void,
): void {
	session.status = status;
	if (shouldAutoRun(session, exitCode) && session.activity?.itemId != null)
		spawnRun(session.activity.itemId, session.cwd);
	if (shouldAutoDismiss(session, exitCode)) dismiss(session.id);
	else notify();
}
