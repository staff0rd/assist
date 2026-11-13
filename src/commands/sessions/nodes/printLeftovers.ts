import chalk from "chalk";
import type { Leftover } from "../daemon/worktree/Leftover";

export function printLeftovers(leftovers: Leftover[]): void {
	if (leftovers.length === 0) return;
	console.log(
		chalk.yellow(
			`${leftovers.length} reaped worktree path(s) waiting on Docker to be deleted; assist retries on each daemon restart`,
		),
	);
	for (const { path, reason } of leftovers)
		console.log(`  ${path}\n    ${chalk.dim(reason)}`);
}
