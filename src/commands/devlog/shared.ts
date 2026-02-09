import { execSync } from "node:child_process";
import chalk from "chalk";
import type { Commit } from "./types";

export {
	getRepoName,
	loadConfig,
	saveConfig,
} from "../../shared/loadConfig";
export { loadDevlogEntries } from "./loadDevlogEntries";

function getCommitFiles(hash: string): string[] {
	try {
		const output = execSync(`git show --name-only --format="" ${hash}`, {
			encoding: "utf-8",
		});
		return output.trim().split("\n").filter(Boolean);
	} catch {
		return [];
	}
}

function shouldIgnoreCommit(files: string[], ignorePaths: string[]): boolean {
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

export function parseGitLogCommits(
	output: string,
	ignore: string[],
	afterDate?: string | null,
): Map<string, Commit[]> {
	const lines = output.trim().split("\n");
	const commitsByDate = new Map<string, Commit[]>();

	for (const line of lines) {
		const [date, hash, ...messageParts] = line.split("|");
		const message = messageParts.join("|");

		if (afterDate && date <= afterDate) {
			continue;
		}

		const files = getCommitFiles(hash);
		if (!shouldIgnoreCommit(files, ignore)) {
			const existing = commitsByDate.get(date) || [];
			existing.push({ date, hash, message, files });
			commitsByDate.set(date, existing);
		}
	}

	return commitsByDate;
}
