import chalk from "chalk";
import { loadDenyConfig } from "./loadDenyConfig";

export function denyAdd(
	pattern: string,
	message: string,
	options: { global?: boolean },
): void {
	const { deny, saveDeny } = loadDenyConfig(options.global);

	if (deny.some((r) => r.pattern === pattern)) {
		console.log(chalk.yellow(`Deny rule already exists for: ${pattern}`));
		return;
	}

	deny.push({ pattern, message });
	saveDeny(deny);
	console.log(chalk.green(`Added deny rule: ${pattern} → ${message}`));
}
