import { execSync } from "node:child_process";
import chalk from "chalk";
import {
	getCommitFiles,
	getRepoName,
	loadConfig,
	loadDevlogEntries,
	shouldIgnoreCommit,
} from "./shared";
import type { Commit } from "./types";

function getLastVersionedDate(repoName: string): string | null {
	const entries = loadDevlogEntries(repoName);
	if (entries.size === 0) {
		return null;
	}

	const dates = Array.from(entries.keys()).sort().reverse();
	return dates[0] ?? null;
}

type NextOptions = {
	ignore?: string[];
	verbose?: boolean;
};

export function next(options: NextOptions): void {
	const config = loadConfig();
	const ignore = options.ignore ?? config.devlog?.ignore ?? [];
	const skipDays = new Set(config.devlog?.skip?.days ?? []);
	const repoName = getRepoName();

	const lastDate = getLastVersionedDate(repoName);
	if (!lastDate) {
		console.log(chalk.yellow("No versioned devlog entries found"));
		return;
	}

	const output = execSync(
		"git log --pretty=format:'%ad|%h|%s' --date=short -n 500",
		{ encoding: "utf-8" },
	);

	const lines = output.trim().split("\n");
	const commitsByDate = new Map<string, Commit[]>();

	for (const line of lines) {
		const [date, hash, ...messageParts] = line.split("|");
		const message = messageParts.join("|");

		if (date <= lastDate) {
			continue;
		}

		const files = getCommitFiles(hash);
		if (!shouldIgnoreCommit(files, ignore)) {
			const existing = commitsByDate.get(date) || [];
			existing.push({ date, hash, message, files });
			commitsByDate.set(date, existing);
		}
	}

	// Find the earliest date after lastDate that isn't skipped
	const dates = Array.from(commitsByDate.keys())
		.filter((d) => !skipDays.has(d))
		.sort();
	const targetDate = dates[0];

	if (!targetDate) {
		console.log(chalk.dim("No commits after last versioned entry"));
		return;
	}

	const commits = commitsByDate.get(targetDate) ?? [];

	console.log(`${chalk.bold.blue(targetDate)}`);

	for (const commit of commits) {
		console.log(`  ${chalk.yellow(commit.hash)} ${commit.message}`);
		if (options.verbose) {
			const visibleFiles = commit.files.filter(
				(file) => !ignore.some((p) => file.startsWith(p)),
			);
			for (const file of visibleFiles) {
				console.log(`    ${chalk.dim(file)}`);
			}
		}
	}
}
