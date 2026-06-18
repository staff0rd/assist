import { execFileSync } from "node:child_process";
import { basename } from "node:path";
import { loadBlogSkipDays } from "../loadBlogSkipDays";
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
	const repoName = basename(process.cwd());
	const skipDays = loadBlogSkipDays(repoName);
	const devlogEntries = loadDevlogEntries(repoName);

	const args = ["log"];
	if (options.reverse) args.push("--reverse");
	else args.push("-n", "500");
	args.push("--pretty=format:%ad|%h|%s", "--date=short");
	const output = execFileSync("git", args, { encoding: "utf8" });

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
