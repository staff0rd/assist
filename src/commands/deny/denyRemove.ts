import chalk from "chalk";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";

type DenyRule = { pattern: string; message: string };

export function denyRemove(pattern: string): void {
	const config = loadProjectConfig();
	const deny: DenyRule[] = (config.deny as DenyRule[]) ?? [];

	const index = deny.findIndex((r) => r.pattern === pattern);
	if (index === -1) {
		console.log(chalk.yellow(`No deny rule found for: ${pattern}`));
		return;
	}

	deny.splice(index, 1);
	config.deny = deny.length > 0 ? deny : undefined;
	saveConfig(config);
	console.log(chalk.green(`Removed deny rule: ${pattern}`));
}
