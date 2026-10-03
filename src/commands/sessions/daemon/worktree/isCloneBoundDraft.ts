import type { Session } from "../createSession";
import { isDraftCommand } from "../../shared/isDraftCommand";
import { worktreeConfigFor } from "./worktreeConfigFor";

export function isCloneBoundDraft(session: Session): boolean {
	if (session.worktree || !session.cwd) return false;
	if (session.commandType !== "assist") return false;
	if (!isDraftCommand(session.assistArgs?.[0])) return false;
	const cfg = worktreeConfigFor(session.cwd);
	return cfg.enabled !== true || cfg.includeDrafts !== true;
}
