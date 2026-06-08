import type { Session } from "./createSession";
import { shouldAutoDismiss } from "./shouldAutoDismiss";

export function applyStatusChange(
	session: Session,
	status: Session["status"],
	exitCode: number | undefined,
	dismiss: (id: string) => void,
	notify: () => void,
): void {
	session.status = status;
	if (shouldAutoDismiss(session, exitCode)) dismiss(session.id);
	else notify();
}
