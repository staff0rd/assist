import { execSync } from "node:child_process";
import chalk from "chalk";
import semver from "semver";
import {
	getCommitFiles,
	getRepoName,
	loadConfig,
	loadDevlogEntries,
	shouldIgnoreCommit,
} from "./shared";
import type { Commit } from "./types";

type LastVersionInfo = {
	date: string;
	version: string;
};

function getLastVersionInfo(repoName: string): LastVersionInfo | null {
	const entries = loadDevlogEntries(repoName);
	if (entries.size === 0) {
		return null;
	}

	const dates = Array.from(entries.keys()).sort().reverse();
	const lastDate = dates[0];
	if (!lastDate) {
		return null;
	}

	const lastEntries = entries.get(lastDate);
	const lastVersion = lastEntries?.[0]?.version;
	if (!lastVersion) {
		return null;
	}

	return { date: lastDate, version: lastVersion };
}

function bumpVersion(version: string, type: "patch" | "minor"): string {
	const cleaned = semver.clean(version) ?? semver.coerce(version)?.version;
	if (!cleaned) {
		return version;
	}
	const bumped = semver.inc(cleaned, type);
	if (!bumped) {
		return version;
	}
	if (type === "minor") {
		// Remove patch number for minor versions (v1.3.0 -> v1.3)
		const parsed = semver.parse(bumped);
		return parsed ? `v${parsed.major}.${parsed.minor}` : `v${bumped}`;
	}
	return `v${bumped}`;
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

	const lastInfo = getLastVersionInfo(repoName);
	if (!lastInfo) {
		console.log(chalk.yellow("No versioned devlog entries found"));
		return;
	}

	const lastDate = lastInfo.date;
	const patchVersion = bumpVersion(lastInfo.version, "patch");
	const minorVersion = bumpVersion(lastInfo.version, "minor");

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

	console.log(`${chalk.bold("name:")} ${repoName}`);
	console.log(
		`${chalk.bold("version:")} ${patchVersion} (patch) or ${minorVersion} (minor)`,
	);
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
