import chalk from "chalk";
import { formatItemId, parseItemId } from "../formatItemId";
import { setStatus } from "../shared";

export async function start(id: string): Promise<void> {
	const name = await setStatus(id, "in-progress");
	if (name) {
		console.log(
			chalk.green(`Started item ${formatItemId(parseItemId(id))}: ${name}`),
		);
	}
}
