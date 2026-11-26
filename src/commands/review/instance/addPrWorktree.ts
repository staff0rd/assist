import type { RunCommand } from "./runInheritedCommand";

export async function addPrWorktree(
	run: RunCommand,
	repoRoot: string,
	prNumber: number,
	sha: string,
	dir: string,
): Promise<void> {
	await run("git", ["fetch", "origin", `pull/${prNumber}/head`], {
		cwd: repoRoot,
	});
	await run("git", ["worktree", "add", "--detach", dir, sha], {
		cwd: repoRoot,
	});
}
