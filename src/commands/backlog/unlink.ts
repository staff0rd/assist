import chalk from "chalk";
import { and, eq } from "drizzle-orm";
import { links } from "./backlogSchema";
import { loadItem } from "./loadItem";
import { getReady } from "./shared";

export async function unlink(fromId: string, toId: string): Promise<void> {
	const fromNum = Number.parseInt(fromId, 10);
	const toNum = Number.parseInt(toId, 10);

	const { orm } = await getReady();

	const fromItem = await loadItem(orm, fromNum);
	if (!fromItem) {
		console.log(chalk.red(`Item #${fromId} not found.`));
		return;
	}

	if (!fromItem.links || fromItem.links.length === 0) {
		console.log(chalk.yellow(`No links found on item #${fromId}.`));
		return;
	}

	if (!fromItem.links.some((l) => l.targetId === toNum)) {
		console.log(chalk.yellow(`No link from #${fromId} to #${toId} found.`));
		return;
	}

	await orm
		.delete(links)
		.where(and(eq(links.itemId, fromNum), eq(links.targetId, toNum)));
	console.log(chalk.green(`Removed link from #${fromId} to #${toId}.`));
}
