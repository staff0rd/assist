import { applyStatusChange } from "./applyStatusChange";
import type { Session } from "./createSession";
import type { StatusChangeDeps } from "./finishStatusChange";
import { otherTreeHolders } from "./worktree/otherTreeHolders";

export function makeStatusChangeHandler(
	sessions: Map<string, Session>,
	deps: StatusChangeDeps,
) {
	return (s: Session, status: Session["status"], exitCode?: number) =>
		applyStatusChange(
			s,
			status,
			exitCode,
			deps,
			(session) => otherTreeHolders(sessions, session).length > 0,
		);
}
