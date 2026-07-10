import chalk from "chalk";
import { formatItemId, parseItemId } from "./formatItemId";
import { getReady } from "./shared";
import { updateStarred } from "./updateStarred";

/**
 * Set an item's starred flag via a targeted write, printing a not-found message
 * when no item matches. Returns the item's name, or `undefined` when missing.
 */
export async function setStarred(
	id: string,
	starred: boolean,
): Promise<string | undefined> {
	const { orm } = await getReady();
	const numId = parseItemId(id);
	const name = await updateStarred(orm, numId, starred);
	if (name === undefined)
		console.log(chalk.red(`Item ${formatItemId(numId)} not found.`));
	return name;
}
