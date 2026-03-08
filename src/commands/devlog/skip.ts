import { writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import { loadRawYaml } from "../../shared/loadRawYaml";
import { BLOG_REPO_ROOT } from "./loadBlogSkipDays";
import { getRepoName } from "./shared";

function getBlogConfigPath(): string {
	return join(BLOG_REPO_ROOT, "assist.yml");
}

export function skip(date: string): void {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		console.log(chalk.red("Invalid date format. Use YYYY-MM-DD"));
		process.exit(1);
	}

	const repoName = getRepoName();
	const configPath = getBlogConfigPath();
	const config = loadRawYaml(configPath);
	const devlog = (config.devlog ?? {}) as Record<string, unknown>;
	const skip = (devlog.skip ?? {}) as Record<string, unknown>;
	const skipDays = (skip[repoName] as string[]) ?? [];

	if (skipDays.includes(date)) {
		console.log(
			chalk.yellow(`${date} is already in skip list for ${repoName}`),
		);
		return;
	}

	skipDays.push(date);
	skipDays.sort();

	skip[repoName] = skipDays;
	devlog.skip = skip;
	config.devlog = devlog;

	writeFileSync(configPath, stringifyYaml(config, { lineWidth: 0 }));
	console.log(chalk.green(`Added ${date} to skip list for ${repoName}`));
}
