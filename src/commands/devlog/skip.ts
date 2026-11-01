import { writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import { loadRawYaml } from "../../shared/loadRawYaml";
import { isValidWeek } from "./isoWeek";
import { BLOG_REPO_ROOT } from "./loadBlogSkipWeeks";
import { getRepoName } from "./shared";

function getBlogConfigPath(): string {
	return join(BLOG_REPO_ROOT, "assist.yml");
}

export function skip(week: string): void {
	if (!isValidWeek(week)) {
		console.log(chalk.red("Invalid week. Use YYYY-Www (e.g. 2026-W33)"));
		process.exit(1);
	}

	const repoName = getRepoName();
	const configPath = getBlogConfigPath();
	const config = loadRawYaml(configPath);
	const devlog = (config.devlog ?? {}) as Record<string, unknown>;
	const skip = (devlog.skip ?? {}) as Record<string, unknown>;
	const skipWeeks = (skip[repoName] as string[]) ?? [];

	if (skipWeeks.includes(week)) {
		console.log(
			chalk.yellow(`${week} is already in skip list for ${repoName}`),
		);
		return;
	}

	skipWeeks.push(week);
	skipWeeks.sort();

	skip[repoName] = skipWeeks;
	devlog.skip = skip;
	config.devlog = devlog;

	writeFileSync(configPath, stringifyYaml(config, { lineWidth: 0 }));
	console.log(chalk.green(`Added ${week} to skip list for ${repoName}`));
}
