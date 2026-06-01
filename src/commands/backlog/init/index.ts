import chalk from "chalk";
import { getBacklogDb } from "../getBacklogDb";
import { getOrigin } from "../shared";

export async function init(): Promise<void> {
	// Connecting creates the schema if it does not yet exist.
	await getBacklogDb();
	console.log(
		chalk.green(
			`Backlog database ready. This repository maps to origin: ${getOrigin()}`,
		),
	);
}
