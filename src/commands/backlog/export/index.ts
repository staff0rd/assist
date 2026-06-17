import { writeFile } from "node:fs/promises";
import chalk from "chalk";
import { withDbClient } from "../../../shared/db/getDb";
import { buildDump } from "../dump/buildDump";
import { copyTableOut } from "../dump/copyTableOut";

/**
 * Export the entire backlog database as a self-contained, versioned dump of
 * per-table COPY data. Writes to `file`, or to stdout when no file is given.
 */
export async function exportBacklog(file?: string): Promise<void> {
	const dump = await withDbClient((client) =>
		buildDump((table) => copyTableOut(client, table)),
	);

	if (file) {
		await writeFile(file, dump);
		console.error(
			chalk.green(`Exported backlog to ${file} (${dump.length} bytes).`),
		);
		return;
	}

	process.stdout.write(dump);
}
