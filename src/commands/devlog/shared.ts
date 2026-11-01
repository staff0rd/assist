import chalk from "chalk";
import type { Commit } from "./types";

export { getRepoName } from "../../shared/getRepoName";
export { loadConfig } from "../../shared/loadConfig";

export function printCommitsWithFiles(
	commits: Commit[],
	ignore: string[],
	verbose: boolean,
): void {
	for (const commit of commits) {
		console.log(
			`  ${chalk.dim(commit.date)} ${chalk.yellow(commit.hash)} ${commit.message}`,
		);
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
