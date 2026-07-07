import chalk from "chalk";
import { appendComment } from "../appendComment";
import { checkSubtasksComplete } from "../checkSubtasksComplete";
import { findOneItem } from "../shared";
import { updateStatus } from "../updateStatus";

export async function done(id: string, summary?: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) return;

	const { orm, item } = found;
	if (!checkSubtasksComplete(id, item)) {
		process.exitCode = 1;
		return;
	}

	if (item.plan && item.plan.length > 0) {
		const completedCount = (item.currentPhase ?? 1) - 1;
		const pending = item.plan.slice(completedCount);
		if (pending.length > 0) {
			console.log(
				chalk.red(
					`Cannot complete item #${id}: ${pending.length} pending phase(s):`,
				),
			);
			for (const phase of pending) {
				console.log(chalk.yellow(`  - ${phase.name}`));
			}
			process.exitCode = 1;
			return;
		}
	}

	await updateStatus(orm, item.id, "done");

	if (summary) {
		const phase = item.currentPhase ?? 1;
		await appendComment(orm, item.id, summary, { phase, type: "summary" });
	}

	console.log(chalk.green(`Completed item #${id}: ${item.name}`));
}
