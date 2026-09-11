import chalk from "chalk";
import { litellmConfigHelp } from "./litellmConfigHelp";
import { type LitellmConfig, readLitellmConfig } from "./readLitellmConfig";

export function resolveLitellmConfig(): LitellmConfig {
	const { config, missing } = readLitellmConfig();

	if (!config) {
		console.error(chalk.red("LiteLLM is not configured"));
		for (const key of missing) {
			const entry = litellmConfigHelp.find((help) => help.key === key);
			console.error(
				chalk.red(`  ${key} is not set. Set it with: ${entry?.setter}`),
			);
		}
		process.exit(1);
	}

	return config;
}
