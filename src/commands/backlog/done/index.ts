import chalk from "chalk";
import { addPhaseSummary } from "../addComment";
import { loadAndFindItem, saveBacklog } from "../shared";

export async function done(id: string, summary?: string): Promise<void> {
	const result = loadAndFindItem(id);
	if (!result) return;

	const { item } = result;
	if (item.plan && item.plan.length > 0) {
		const completed = item.currentPhase ?? 0;
		const pending = item.plan.slice(completed);
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
		const phase = item.currentPhase ?? 0;
		addPhaseSummary(item, summary, phase);
	}

	saveBacklog(result.items);
	console.log(chalk.green(`Completed item #${id}: ${item.name}`));
}
