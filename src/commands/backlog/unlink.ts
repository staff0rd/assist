import chalk from "chalk";
import { and, eq } from "drizzle-orm";
import { links } from "../../shared/db/schema";
import { formatItemId, parseItemId } from "./formatItemId";
import { loadItem } from "./loadItem";
import { getReady } from "./shared";

export async function unlink(fromId: string, toId: string): Promise<void> {
	const fromNum = parseItemId(fromId);
	const toNum = parseItemId(toId);

	const { orm } = await getReady();

	const fromItem = await loadItem(orm, fromNum);
	if (!fromItem) {
		console.log(chalk.red(`Item ${formatItemId(fromNum)} not found.`));
		return;
	}

	if (!fromItem.links || fromItem.links.length === 0) {
		console.log(
			chalk.yellow(`No links found on item ${formatItemId(fromNum)}.`),
		);
		return;
	}

	if (!fromItem.links.some((l) => l.targetId === toNum)) {
		console.log(
			chalk.yellow(
				`No link from ${formatItemId(fromNum)} to ${formatItemId(toNum)} found.`,
			),
		);
		return;
	}

	await orm
		.delete(links)
		.where(and(eq(links.itemId, fromNum), eq(links.targetId, toNum)));
	console.log(
		chalk.green(
			`Removed link from ${formatItemId(fromNum)} to ${formatItemId(toNum)}.`,
		),
	);
}
