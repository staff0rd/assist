import { execSync } from "node:child_process";
import { basename } from "node:path";
import {
	loadConfig,
	loadDevlogEntries,
	parseGitLogCommits,
	printCommitsWithFiles,
} from "../shared";
import { printDateHeader } from "./printDateHeader";

type ListOptions = {
	days?: number;
	ignore?: string[];
	reverse?: boolean;
	since?: string;
	verbose?: boolean;
};

export function list(options: ListOptions): void {
	const config = loadConfig();
	const days = options.days ?? 30;
	const ignore = options.ignore ?? config.devlog?.ignore ?? [];
	const skipDays = new Set(config.devlog?.skip?.days ?? []);
	const repoName = basename(process.cwd());
	const devlogEntries = loadDevlogEntries(repoName);

	const reverseFlag = options.reverse ? "--reverse " : "";
	const limitFlag = options.reverse ? "" : "-n 500 ";
	const output = execSync(
		`git log ${reverseFlag}${limitFlag}--pretty=format:'%ad|%h|%s' --date=short`,
		{ encoding: "utf-8" },
	);

	const commitsByDate = parseGitLogCommits(output, ignore);

	let dateCount = 0;
	let isFirst = true;

	for (const [date, dateCommits] of commitsByDate) {
		if (options.since) {
			if (date < options.since) {
				break;
			}
		} else if (dateCount >= days) {
			break;
		}
		dateCount++;

		if (!isFirst) {
			console.log();
		}
		isFirst = false;

		printDateHeader(date, skipDays.has(date), devlogEntries.get(date));
		printCommitsWithFiles(dateCommits, ignore, options.verbose ?? false);
	}
}
