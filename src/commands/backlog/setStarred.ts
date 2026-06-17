import chalk from "chalk";
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
	const name = await updateStarred(orm, Number.parseInt(id, 10), starred);
	if (name === undefined) console.log(chalk.red(`Item #${id} not found.`));
	return name;
}
