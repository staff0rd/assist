import type { Session } from "../createSession";
import { isCloneBoundDraft } from "./isCloneBoundDraft";
import { otherTreeHolders } from "./otherTreeHolders";

export function closeGateApplies(
	sessions: Map<string, Session>,
	session: Session,
): boolean {
	if (otherTreeHolders(sessions, session).length > 0) return false;
	if (session.worktree) return true;
	if (isCloneBoundDraft(session)) return false;
	if (!session.cwd) return false;
	return session.status === "running" || session.status === "waiting";
}
