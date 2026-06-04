import chalk from "chalk";
import { findOneItem } from "./shared";

export async function plan(id: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) return;

	const { item } = found;

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
