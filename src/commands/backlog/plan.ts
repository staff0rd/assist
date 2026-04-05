import chalk from "chalk";
import { loadAndFindItem } from "./shared";

export function plan(id: string): void {
	const result = loadAndFindItem(id);
	if (!result) return;

	const { item } = result;

	if (!item.plan || item.plan.length === 0) {
		console.log(chalk.dim("No plan defined for this item."));
		return;
	}

	console.log(chalk.bold(item.name));
	console.log();

	for (const [i, phase] of item.plan.entries()) {
		console.log(`${chalk.bold(`Phase ${i + 1}:`)} ${phase.name}`);
		for (const task of phase.tasks) {
			console.log(`  - ${task.task}`);
		}
		console.log();
	}
}
