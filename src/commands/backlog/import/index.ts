import { readFile } from "node:fs/promises";
import chalk from "chalk";
import { withDbClient } from "../../../shared/db/getDb";
import { countCopyRows } from "../dump/countCopyRows";
import { parseDump } from "../dump/parseDump";
import { validateDump } from "../dump/validateDump";
import { confirmReplace } from "./confirmReplace";
import { readStdinBuffer } from "./readStdinBuffer";
import { restore } from "./restore";

type ImportOptions = { yes?: boolean };

/**
 * Restore the backlog database from a dump file (or stdin), replacing all data.
 * Parses and validates before any DB access, prompts for confirmation (skipped by
 * `--yes`), then replaces everything in one transaction with no partial writes.
 */
export async function importBacklog(
	file: string | undefined,
	options: ImportOptions = {},
): Promise<void> {
	const raw = file ? await readFile(file) : await readStdinBuffer();
	const parsed = parseDump(raw);
	validateDump(parsed);
	const { tables } = parsed.header;
	const incoming = tables.map((t) =>
		countCopyRows(parsed.sections.get(t.name) ?? Buffer.alloc(0)),
	);

	await withDbClient(async (client) => {
		if (
			!options.yes &&
			!(await confirmReplace(client, tables, incoming, !file))
		) {
			console.error(chalk.yellow("Import cancelled; no changes made."));
			return;
		}
		await restore(client, parsed);
		const total = incoming.reduce((sum, n) => sum + n, 0);
		console.error(
			chalk.green(
				`Imported backlog: ${total} rows restored across ${tables.length} tables.`,
			),
		);
	});
}
