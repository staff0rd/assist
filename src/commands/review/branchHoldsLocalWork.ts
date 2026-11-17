import { gitSyncOrNull } from "../sessions/daemon/worktree/git";
import { tipSetFromRemote } from "../sessions/daemon/worktree/tipSetFromRemote";

export function branchHoldsLocalWork(cwd: string, ref: string): boolean {
	const unpushed = gitSyncOrNull(cwd, [
		"rev-list",
		"--count",
		ref,
		"--not",
		"--remotes",
	]);
	if (unpushed === "0") return false;
	const lastMove = gitSyncOrNull(cwd, [
		"reflog",
		"show",
		"-n1",
		"--format=%gs",
		ref,
	]);
	const remotes = (gitSyncOrNull(cwd, ["remote"]) ?? "").split("\n");
	return !lastMove || !tipSetFromRemote(lastMove, remotes);
}
