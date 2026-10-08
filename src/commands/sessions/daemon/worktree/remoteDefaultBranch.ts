import { gitSyncOrNull } from "./git";
import { cloneHead } from "./cloneHead";

export function remoteDefaultBranch(clone: string): string {
	const head = gitSyncOrNull(clone, [
		"symbolic-ref",
		"--short",
		"refs/remotes/origin/HEAD",
	]);
	if (!head) return cloneHead(clone) ?? "main";
	const slash = head.indexOf("/");
	return slash === -1 ? head : head.slice(slash + 1);
}
