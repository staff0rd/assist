import chalk from "chalk";
import { loadConfig, saveConfig } from "./shared";

export function skip(date: string): void {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		console.log(chalk.red("Invalid date format. Use YYYY-MM-DD"));
		process.exit(1);
	}

	const config = loadConfig();

	const skipDays = config.devlog?.skip?.days ?? [];

	if (skipDays.includes(date)) {
		console.log(chalk.yellow(`${date} is already in skip list`));
		return;
	}

	skipDays.push(date);
	skipDays.sort();

	config.devlog = {
		...config.devlog,
		skip: {
			...config.devlog?.skip,
			days: skipDays,
		},
	};

	saveConfig(config);
	console.log(chalk.green(`Added ${date} to skip list`));
}
