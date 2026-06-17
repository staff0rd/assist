import chalk from "chalk";
import { getDb } from "../../../shared/db/getDb";
import { getOrigin } from "../shared";

export async function init(): Promise<void> {
	// Connecting creates the schema if it does not yet exist.
	await getDb();
	console.log(
		chalk.green(
			`Backlog database ready. This repository maps to origin: ${getOrigin()}`,
		),
	);
}
