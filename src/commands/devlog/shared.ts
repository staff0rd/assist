import { execSync } from "node:child_process";
import chalk from "chalk";
import type { Commit } from "./types";

export {
	getRepoName,
	loadConfig,
	saveConfig,
} from "../../shared/loadConfig.js";
export { loadDevlogEntries } from "./loadDevlogEntries.js";

export function getCommitFiles(hash: string): string[] {
	try {
		const output = execSync(`git show --name-only --format="" ${hash}`, {
			encoding: "utf-8",
		});
		return output.trim().split("\n").filter(Boolean);
	} catch {
		return [];
	}
}

export function shouldIgnoreCommit(
	files: string[],
	ignorePaths: string[],
): boolean {
	if (ignorePaths.length === 0 || files.length === 0) {
		return false;
	}
	return files.every((file) =>
		ignorePaths.some((ignorePath) => file.startsWith(ignorePath)),
	);
}

export function printCommitsWithFiles(
	commits: Commit[],
	ignore: string[],
	verbose: boolean,
): void {
	for (const commit of commits) {
		console.log(`  ${chalk.yellow(commit.hash)} ${commit.message}`);
		if (verbose) {
			const visibleFiles = commit.files.filter(
				(file) => !ignore.some((p) => file.startsWith(p)),
			);
			for (const file of visibleFiles) {
				console.log(`    ${chalk.dim(file)}`);
			}
		}
	}
}
