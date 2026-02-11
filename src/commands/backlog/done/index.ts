import chalk from "chalk";
import { setStatus } from "../shared";

export async function done(id: string): Promise<void> {
	const name = setStatus(id, "done");
	if (name) {
		console.log(chalk.green(`Completed item #${id}: ${name}`));
	}
}
