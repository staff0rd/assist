import chalk from "chalk";
import type { VersionedCommit } from "./withVersions";

export function printCommits(
	commits: VersionedCommit[],
	ignore: string[],
	verbose: boolean,
): void {
	for (const commit of commits) {
		const version = commit.version ? ` ${chalk.cyan(commit.version)}` : "";
		console.log(
			`  ${chalk.dim(commit.date)} ${chalk.yellow(commit.hash)}${version} ${commit.message}`,
		);
		if (!verbose) continue;
		for (const file of commit.files) {
			if (!ignore.some((p) => file.startsWith(p))) {
				console.log(`    ${chalk.dim(file)}`);
			}
		}
	}
}
