import chalk from "chalk";
import { removeItem } from "../shared";

export async function del(id: string): Promise<void> {
	const name = removeItem(id);
	if (name) {
		console.log(chalk.green(`Deleted item #${id}: ${name}`));
	}
}
