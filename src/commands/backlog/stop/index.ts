import chalk from "chalk";
import { loadBacklog, saveBacklog } from "../shared";

export async function stop(): Promise<void> {
	const items = await loadBacklog();
	const inProgress = items.filter((item) => item.status === "in-progress");

	if (inProgress.length === 0) {
		console.log(chalk.yellow("No in-progress items to stop."));
		return;
	}

	for (const item of inProgress) {
		item.status = "todo";
		item.currentPhase = 1;
	}

	await saveBacklog(items);

	for (const item of inProgress) {
		console.log(chalk.yellow(`Stopped item #${item.id}: ${item.name}`));
	}
}
