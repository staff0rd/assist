import { execSync } from "node:child_process";
import { basename } from "node:path";
import chalk from "chalk";
import {
	loadConfig,
	loadDevlogEntries,
	parseGitLogCommits,
	printCommitsWithFiles,
} from "./shared";

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

		const entries = devlogEntries.get(date);
		if (skipDays.has(date)) {
			console.log(`${chalk.bold.blue(date)} ${chalk.dim("skipped")}`);
		} else if (entries && entries.length > 0) {
			const entryInfo = entries
				.map((e) => `${chalk.green(e.version)} ${e.title}`)
				.join(" | ");
			console.log(`${chalk.bold.blue(date)} ${entryInfo}`);
		} else {
			console.log(`${chalk.bold.blue(date)} ${chalk.red("⚠ devlog missing")}`);
		}

		printCommitsWithFiles(dateCommits, ignore, options.verbose ?? false);
	}
}
