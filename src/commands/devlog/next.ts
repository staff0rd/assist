import { execSync } from "node:child_process";
import chalk from "chalk";
import { bumpVersion, getLastVersionInfo } from "./getLastVersionInfo.js";
import {
	getCommitFiles,
	getRepoName,
	loadConfig,
	printCommitsWithFiles,
	shouldIgnoreCommit,
} from "./shared";
import type { Commit } from "./types";

type NextOptions = {
	ignore?: string[];
	verbose?: boolean;
};

export function next(options: NextOptions): void {
	const config = loadConfig();
	const ignore = options.ignore ?? config.devlog?.ignore ?? [];
	const skipDays = new Set(config.devlog?.skip?.days ?? []);
	const repoName = getRepoName();

	const lastInfo = getLastVersionInfo(repoName);
	const lastDate = lastInfo?.date ?? null;
	const patchVersion = lastInfo ? bumpVersion(lastInfo.version, "patch") : null;
	const minorVersion = lastInfo ? bumpVersion(lastInfo.version, "minor") : null;

	const output = execSync(
		"git log --pretty=format:'%ad|%h|%s' --date=short -n 500",
		{ encoding: "utf-8" },
	);

	const lines = output.trim().split("\n");
	const commitsByDate = new Map<string, Commit[]>();

	for (const line of lines) {
		const [date, hash, ...messageParts] = line.split("|");
		const message = messageParts.join("|");

		if (lastDate && date <= lastDate) {
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
		if (lastInfo) {
			console.log(chalk.dim("No commits after last versioned entry"));
		} else {
			console.log(chalk.dim("No commits found"));
		}
		return;
	}

	const commits = commitsByDate.get(targetDate) ?? [];

	console.log(`${chalk.bold("name:")} ${repoName}`);
	if (patchVersion && minorVersion) {
		console.log(
			`${chalk.bold("version:")} ${patchVersion} (patch) or ${minorVersion} (minor)`,
		);
	} else {
		console.log(`${chalk.bold("version:")} v0.1 (initial)`);
	}
	console.log(`${chalk.bold.blue(targetDate)}`);

	printCommitsWithFiles(commits, ignore, options.verbose ?? false);
}
