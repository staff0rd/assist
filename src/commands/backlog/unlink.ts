import chalk from "chalk";
import { loadAndFindItem, saveBacklog } from "./shared";

export async function unlink(fromId: string, toId: string): Promise<void> {
	const toNum = Number.parseInt(toId, 10);

	const result = await loadAndFindItem(fromId);
	if (!result) return;
	const { items, item: fromItem } = result;

	if (!fromItem.links || fromItem.links.length === 0) {
		console.log(chalk.yellow(`No links found on item #${fromId}.`));
		return;
	}

	const before = fromItem.links.length;
	fromItem.links = fromItem.links.filter((l) => l.targetId !== toNum);

	if (fromItem.links.length === before) {
		console.log(chalk.yellow(`No link from #${fromId} to #${toId} found.`));
		return;
	}

	if (fromItem.links.length === 0) {
		fromItem.links = undefined;
	}

	await saveBacklog(items);
	console.log(chalk.green(`Removed link from #${fromId} to #${toId}.`));
}
