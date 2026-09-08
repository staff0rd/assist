import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";
import { litellmConfigHelp } from "./litellmConfigHelp";

export function resolveLitellmConfig(): { baseUrl: string; apiKey: string } {
	const litellm = loadConfig().litellm;
	const baseUrl = litellm?.baseUrl?.trim();
	const apiKey = litellm?.apiKey?.trim();

	if (!baseUrl || !apiKey) {
		const missing = [
			...(baseUrl ? [] : ["litellm.baseUrl"]),
			...(apiKey ? [] : ["litellm.apiKey"]),
		];
		console.error(chalk.red("LiteLLM is not configured"));
		for (const key of missing) {
			const entry = litellmConfigHelp.find((help) => help.key === key);
			console.error(
				chalk.red(`  ${key} is not set. Set it with: ${entry?.setter}`),
			);
		}
		process.exit(1);
	}

	return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
