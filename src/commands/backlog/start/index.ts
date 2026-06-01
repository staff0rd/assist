import chalk from "chalk";
import { setStatus } from "../shared";

export async function start(id: string): Promise<void> {
	const name = await setStatus(id, "in-progress");
	if (name) {
		console.log(chalk.green(`Started item #${id}: ${name}`));
	}
}
