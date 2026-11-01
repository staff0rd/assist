import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { captureRepos } from "../captureSetupStepSchema";
import type { CaptureHome } from "./createCaptureHome";

export function removeCaptureWorktrees(capture: CaptureHome): void {
	for (const repo of captureRepos) {
		const repoDir = join(capture.reposDir, repo);
		const git = (...args: string[]) =>
			execFileSync("git", args, { cwd: repoDir, env: capture.env })
				.toString()
				.trim();
		const extra = git("worktree", "list", "--porcelain")
			.split("\n")
			.filter((line) => line.startsWith("worktree "))
			.map((line) => line.slice("worktree ".length))
			.filter((path) => path !== repoDir);
		for (const path of extra) git("worktree", "remove", "--force", path);
	}
}
