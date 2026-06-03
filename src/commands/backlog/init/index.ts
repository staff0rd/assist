import chalk from "chalk";
import { getBacklogOrm } from "../getBacklogOrm";
import { getOrigin } from "../shared";

export async function init(): Promise<void> {
	// Connecting creates the schema if it does not yet exist.
	await getBacklogOrm();
	console.log(
		chalk.green(
			`Backlog database ready. This repository maps to origin: ${getOrigin()}`,
		),
	);
}
