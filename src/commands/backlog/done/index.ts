import chalk from "chalk";
import { addPhaseSummary } from "../addComment";
import { loadAndFindItem, saveBacklog } from "../shared";

export async function done(id: string, summary?: string): Promise<void> {
	const result = await loadAndFindItem(id);
	if (!result) return;

	const { item } = result;
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

	item.status = "done";

	if (summary) {
		const phase = item.currentPhase ?? 1;
		addPhaseSummary(item, summary, phase);
	}

	await saveBacklog(result.items);
	console.log(chalk.green(`Completed item #${id}: ${item.name}`));
}
