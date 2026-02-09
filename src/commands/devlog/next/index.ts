import { execSync } from "node:child_process";
import chalk from "chalk";
import { bumpVersion, getLastVersionInfo } from "../getLastVersionInfo";
import {
	getRepoName,
	loadConfig,
	parseGitLogCommits,
	printCommitsWithFiles,
} from "../shared";
import { displayVersion } from "./displayVersion";

type NextOptions = {
	ignore?: string[];
	verbose?: boolean;
};

export function next(options: NextOptions): void {
	const config = loadConfig();
	const ignore = options.ignore ?? config.devlog?.ignore ?? [];
	const skipDays = new Set(config.devlog?.skip?.days ?? []);
	const repoName = getRepoName();

	const lastInfo = getLastVersionInfo(repoName, config);
	const lastDate = lastInfo?.date ?? null;
	const patchVersion = lastInfo ? bumpVersion(lastInfo.version, "patch") : null;
	const minorVersion = lastInfo ? bumpVersion(lastInfo.version, "minor") : null;

	const output = execSync(
		"git log --pretty=format:'%ad|%h|%s' --date=short -n 500",
		{ encoding: "utf-8" },
	);

	const commitsByDate = parseGitLogCommits(output, ignore, lastDate);

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
	displayVersion(
		!!config.commit?.conventional,
		commits[0]?.hash,
		patchVersion,
		minorVersion,
	);
	console.log(`${chalk.bold.blue(targetDate)}`);

	printCommitsWithFiles(commits, ignore, options.verbose ?? false);
}
