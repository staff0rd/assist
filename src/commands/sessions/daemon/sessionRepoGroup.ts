import type { RepoGroup } from "../shared/RepoGroup";
import type { Session } from "./createSession";
import { repoGroupForCwd } from "./repoGroupForCwd";

export function sessionRepoGroup(
	session: Pick<Session, "cwd" | "worktree">,
): RepoGroup | undefined {
	// why: a freshly bound worktree's cwd isn't on disk until addWorktree finishes, so fall back to its clone
	return (
		repoGroupForCwd(session.cwd) ?? repoGroupForCwd(session.worktree?.clone)
	);
}
