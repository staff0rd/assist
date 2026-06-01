import { execSync } from "node:child_process";
import chalk from "chalk";

/**
 * Best-effort `git pull --ff-only` so migration imports the latest committed
 * backlog file. Failures (no upstream, dirty tree, not a repo) are non-fatal:
 * we warn and fall back to whatever is on disk.
 */
export function gitPullBacklog(dir: string): void {
	try {
		execSync("git pull --ff-only", {
			cwd: dir,
			stdio: ["pipe", "pipe", "pipe"],
		});
	} catch {
		console.error(
			chalk.yellow(
				"backlog migrate: git pull skipped (no upstream or pull failed); using the local file.",
			),
		);
	}
}
