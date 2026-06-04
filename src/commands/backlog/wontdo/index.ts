import chalk from "chalk";
import { appendComment } from "../appendComment";
import { findOneItem } from "../shared";
import { updateStatus } from "../updateStatus";

export async function wontdo(id: string, reason?: string): Promise<void> {
	const found = await findOneItem(id);
	if (!found) return;

	const { orm, item } = found;
	await updateStatus(orm, item.id, "wontdo");

	if (reason) {
		const phase = item.currentPhase ?? 1;
		await appendComment(orm, item.id, reason, { phase, type: "summary" });
	}

	console.log(chalk.red(`Won't do item #${id}: ${item.name}`));
}
