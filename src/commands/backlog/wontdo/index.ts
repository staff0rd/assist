import chalk from "chalk";
import { addPhaseSummary } from "../addComment";
import { loadAndFindItem, saveBacklog } from "../shared";

export async function wontdo(id: string, reason?: string): Promise<void> {
	const result = loadAndFindItem(id);
	if (!result) return;

	result.item.status = "wontdo";

	if (reason) {
		const phase = result.item.currentPhase ?? 1;
		addPhaseSummary(result.item, reason, phase);
	}

	saveBacklog(result.items);
	console.log(chalk.red(`Won't do item #${id}: ${result.item.name}`));
}
