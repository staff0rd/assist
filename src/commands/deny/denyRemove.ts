import chalk from "chalk";
import { loadDenyConfig } from "./loadDenyConfig";

export function denyRemove(
	pattern: string,
	options: { global?: boolean },
): void {
	const { deny, saveDeny } = loadDenyConfig(options.global);

	const index = deny.findIndex((r) => r.pattern === pattern);
	if (index === -1) {
		console.log(chalk.yellow(`No deny rule found for: ${pattern}`));
		return;
	}

	deny.splice(index, 1);
	saveDeny(deny.length > 0 ? deny : undefined);
	console.log(chalk.green(`Removed deny rule: ${pattern}`));
}
