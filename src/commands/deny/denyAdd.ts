import chalk from "chalk";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";

type DenyRule = { pattern: string; message: string };

export function denyAdd(pattern: string, message: string): void {
	const config = loadProjectConfig();
	const deny: DenyRule[] = (config.deny as DenyRule[]) ?? [];

	if (deny.some((r) => r.pattern === pattern)) {
		console.log(chalk.yellow(`Deny rule already exists for: ${pattern}`));
		return;
	}

	deny.push({ pattern, message });
	config.deny = deny;
	saveConfig(config);
	console.log(chalk.green(`Added deny rule: ${pattern} → ${message}`));
}
