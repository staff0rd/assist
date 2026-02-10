import { getLastVersionInfo } from "../getLastVersionInfo";
import { getRepoName, loadConfig } from "../shared";
import type { Commit } from "../types";
import {
	displayNextEntry,
	fetchCommitsByDate,
	findTargetDate,
	getCommitsForDate,
	getLastDate,
	logNoCommits,
	resolveIgnoreList,
	resolveSkipDays,
} from "./displayNextEntry";

type NextOptions = {
	ignore?: string[];
	verbose?: boolean;
};

type NextContext = {
	config: ReturnType<typeof loadConfig>;
	repoName: string;
	lastInfo: ReturnType<typeof getLastVersionInfo>;
	ignore: string[];
	verbose: boolean;
};

function resolveContextData(
	config: ReturnType<typeof loadConfig>,
	options: NextOptions,
) {
	const repoName = getRepoName();
	const lastInfo = getLastVersionInfo(repoName, config);
	return { repoName, lastInfo, ignore: resolveIgnoreList(options, config) };
}

function buildContext(options: NextOptions): NextContext {
	const config = loadConfig();
	const data = resolveContextData(config, options);
	return { config, ...data, verbose: options.verbose ?? false };
}

function fetchNextCommits(ctx: NextContext) {
	const commitsByDate = fetchCommitsByDate(
		ctx.ignore,
		getLastDate(ctx.lastInfo),
	);
	const targetDate = findTargetDate(commitsByDate, resolveSkipDays(ctx.config));
	return targetDate
		? { targetDate, commits: getCommitsForDate(commitsByDate, targetDate) }
		: null;
}

function showResult(
	ctx: NextContext,
	found: { targetDate: string; commits: Commit[] } | null,
): void {
	if (!found) {
		logNoCommits(ctx.lastInfo);
		return;
	}
	displayNextEntry(ctx, found.targetDate, found.commits);
}

export function next(options: NextOptions): void {
	const ctx = buildContext(options);
	showResult(ctx, fetchNextCommits(ctx));
}
