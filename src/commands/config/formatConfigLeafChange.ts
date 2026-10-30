import chalk from "chalk";
import type { RepoConfigLeafChange } from "./diffRepoConfigLeaves";
import { maskConfigKeySecrets } from "./maskConfigKeySecrets";

function show(key: string, value: unknown): string {
	return JSON.stringify(maskConfigKeySecrets(key, value));
}

export function formatConfigLeafChange(change: RepoConfigLeafChange): string {
	const to = show(change.key, change.to);
	return "from" in change
		? chalk.yellow(
				`  ~ ${change.key}: ${show(change.key, change.from)} → ${to}`,
			)
		: chalk.green(`  + ${change.key}: ${to}`);
}
