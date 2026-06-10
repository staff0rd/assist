import { applyStatusChange } from "./applyStatusChange";
import type { Session } from "./createSession";

export function makeStatusChangeHandler(
	dismiss: (id: string) => void,
	notify: () => void,
	reuseForRun: (session: Session, itemId: number) => void,
) {
	return (s: Session, status: Session["status"], exitCode?: number) =>
		applyStatusChange(s, status, exitCode, dismiss, notify, reuseForRun);
}
