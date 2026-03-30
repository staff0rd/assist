import chalk from "chalk";
import { addPhaseSummary } from "../addComment";
import { loadAndFindItem, saveBacklog } from "../shared";

export async function done(id: string, summary?: string): Promise<void> {
	const result = loadAndFindItem(id);
	if (!result) return;

	result.item.status = "done";

	if (summary) {
		const phase = result.item.currentPhase ?? 0;
		addPhaseSummary(result.item, summary, phase);
	}

	saveBacklog(result.items);
	console.log(chalk.green(`Completed item #${id}: ${result.item.name}`));
}
