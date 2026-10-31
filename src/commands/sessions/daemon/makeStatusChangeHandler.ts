import { applyStatusChange } from "./applyStatusChange";
import type { Session } from "./createSession";
import type { StatusChangeDeps } from "./finishStatusChange";
import { otherAgentTreeHolders } from "./worktree/otherAgentTreeHolders";

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
			(session) => otherAgentTreeHolders(sessions, session).length > 0,
		);
}
