import { execSync } from "node:child_process";
import chalk from "chalk";
import { bumpVersion } from "../../getLastVersionInfo";
import { parseGitLogCommits, printCommitsWithFiles } from "../../shared";
import type { Commit } from "../../types";
import { displayVersion } from "./displayVersion";

function computeVersions(lastInfo: { version: string } | null) {
	if (!lastInfo) return { patch: null, minor: null };
	return {
		patch: bumpVersion(lastInfo.version, "patch"),
		minor: bumpVersion(lastInfo.version, "minor"),
	};
}

export function findTargetDate(
	commitsByDate: Map<string, unknown>,
	skipDays: Set<string>,
): string | undefined {
	return Array.from(commitsByDate.keys())
		.filter((d) => !skipDays.has(d))
		.sort()[0];
}

export function fetchCommitsByDate(ignore: string[], lastDate: string | null) {
	const output = execSync(
		"git log --pretty=format:'%ad|%h|%s' --date=short -n 500",
		{ encoding: "utf-8" },
	);
	return parseGitLogCommits(output, ignore, lastDate);
}

function printVersionInfo(
	config: { commit?: { conventional?: boolean } },
	lastInfo: { version: string } | null,
	firstHash: string | undefined,
): void {
	const versions = computeVersions(lastInfo);
	displayVersion(
		!!config.commit?.conventional,
		firstHash,
		versions.patch,
		versions.minor,
	);
}

export function resolveIgnoreList(
	options: { ignore?: string[] },
	config: { devlog?: { ignore?: string[] } },
): string[] {
	return options.ignore ?? config.devlog?.ignore ?? [];
}

export function resolveSkipDays(config: {
	devlog?: { skip?: { days?: string[] } };
}): Set<string> {
	return new Set(config.devlog?.skip?.days ?? []);
}

export function getLastDate(lastInfo: { date?: string } | null): string | null {
	return lastInfo?.date ?? null;
}

export function getCommitsForDate(
	commitsByDate: Map<string, Commit[]>,
	date: string,
): Commit[] {
	return commitsByDate.get(date) ?? [];
}

function noCommitsMessage(hasLastInfo: boolean): string {
	return hasLastInfo
		? "No commits after last versioned entry"
		: "No commits found";
}

function logName(repoName: string): void {
	console.log(`${chalk.bold("name:")} ${repoName}`);
}

type DisplayContext = {
	repoName: string;
	config: { commit?: { conventional?: boolean } };
	lastInfo: { version: string } | null;
	ignore: string[];
	verbose: boolean;
};

export function displayNextEntry(
	ctx: DisplayContext,
	targetDate: string,
	commits: Commit[],
): void {
	logName(ctx.repoName);
	printVersionInfo(ctx.config, ctx.lastInfo, commits[0]?.hash);
	console.log(chalk.bold.blue(targetDate));
	printCommitsWithFiles(commits, ctx.ignore, ctx.verbose);
}

export function logNoCommits(lastInfo: unknown): void {
	console.log(chalk.dim(noCommitsMessage(!!lastInfo)));
}
