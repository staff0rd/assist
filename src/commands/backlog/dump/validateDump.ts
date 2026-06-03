import {
	DUMP_FORMAT,
	DUMP_TABLES,
	DUMP_VERSION,
	type DumpTable,
} from "./DumpTable";
import type { ParsedDump } from "./parseDump";

/** Canonical JSON of a table list's names and column orders, for set comparison. */
function tableShape(tables: DumpTable[]): string {
	return JSON.stringify(tables.map(({ name, columns }) => ({ name, columns })));
}

/**
 * Assert a parsed dump is one this build can faithfully restore: it must declare
 * the expected format and version, and carry exactly the backlog tables (with the
 * column order) we know how to COPY back in. Throws with a clear reason otherwise.
 */
export function validateDump({ header, sections }: ParsedDump): void {
	const missing = DUMP_TABLES.find(({ name }) => !sections.has(name))?.name;
	const checks: [boolean, string][] = [
		[
			header.format === DUMP_FORMAT,
			`Unrecognised dump format "${header.format}" (expected "${DUMP_FORMAT}").`,
		],
		[
			header.version === DUMP_VERSION,
			`Unsupported dump version ${header.version} (this build restores version ${DUMP_VERSION}).`,
		],
		[
			tableShape(header.tables ?? []) === tableShape(DUMP_TABLES),
			"Dump table set does not match this build's backlog schema; cannot restore.",
		],
		[!missing, `Invalid dump: missing data section for "${missing}".`],
	];
	const failure = checks.find(([ok]) => !ok);
	if (failure) throw new Error(failure[1]);
}
