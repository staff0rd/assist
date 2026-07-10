import chalk from "chalk";
import { formatItemId, parseItemId } from "../formatItemId";
import { setStarred } from "../setStarred";

export async function star(id: string): Promise<void> {
	const name = await setStarred(id, true);
	if (name) {
		console.log(
			chalk.green(`Starred item ${formatItemId(parseItemId(id))}: ${name}`),
		);
	}
}
