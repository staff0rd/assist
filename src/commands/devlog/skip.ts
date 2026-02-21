import chalk from "chalk";
import { loadProjectConfig, saveConfig } from "./shared";

export function skip(date: string): void {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		console.log(chalk.red("Invalid date format. Use YYYY-MM-DD"));
		process.exit(1);
	}

	const config = loadProjectConfig();
	const devlog = (config.devlog ?? {}) as Record<string, unknown>;
	const skip = (devlog.skip ?? {}) as Record<string, unknown>;
	const skipDays = (skip.days as string[]) ?? [];

	if (skipDays.includes(date)) {
		console.log(chalk.yellow(`${date} is already in skip list`));
		return;
	}

	skipDays.push(date);
	skipDays.sort();

	skip.days = skipDays;
	devlog.skip = skip;
	config.devlog = devlog;

	saveConfig(config);
	console.log(chalk.green(`Added ${date} to skip list`));
}
