import chalk from "chalk";
import { loadConfig } from "../../shared/loadConfig";

export function denyList(): void {
	const config = loadConfig();
	const deny = config.deny;

	if (!deny || deny.length === 0) {
		console.log(chalk.dim("No deny rules configured."));
		return;
	}

	for (const rule of deny) {
		console.log(`${chalk.red(rule.pattern)} → ${rule.message}`);
	}
}
