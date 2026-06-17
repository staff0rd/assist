import chalk from "chalk";
import { setStarred } from "../setStarred";

export async function unstar(id: string): Promise<void> {
	const name = await setStarred(id, false);
	if (name) {
		console.log(chalk.green(`Unstarred item #${id}: ${name}`));
	}
}
