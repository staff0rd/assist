import type { Session } from "../createSession";
import { isDraftCommand } from "../../shared/isDraftCommand";

export function isCloneBoundDraft(session: Session): boolean {
	if (session.worktree || !session.cwd) return false;
	if (session.commandType !== "assist") return false;
	return isDraftCommand(session.assistArgs?.[0]);
}
