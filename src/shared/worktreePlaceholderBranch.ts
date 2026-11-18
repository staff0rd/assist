import { execSync } from "node:child_process";
import { basename } from "node:path";
import { linkedWorktree } from "./linkedWorktree";

export function worktreePlaceholderBranch(): string | null {
	const tree = linkedWorktree(process.cwd());
	if (!tree) return null;
	const head = currentBranch();
	return head === basename(tree.root) ? head : null;
}

function currentBranch(): string | null {
	try {
		return execSync("git rev-parse --abbrev-ref HEAD", {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return null;
	}
}
