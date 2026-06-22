import { DUMP_FORMAT, DUMP_VERSION } from "./DumpTable";
import type { ParsedDump } from "./parseDump";

/**
 * Assert a parsed dump is one this build can faithfully restore: it must declare
 * the expected format and version, name at least one table, and carry a data
 * section for every table its header lists. The table set itself is whatever the
 * dump captured at export time (self-discovered, not a fixed list), so a dump of
 * a schema this build has never heard of still restores. Throws with a clear
 * reason otherwise.
 */
export function validateDump({ header, sections }: ParsedDump): void {
	const tables = header.tables ?? [];
	const missing = tables.find(({ name }) => !sections.has(name))?.name;
	const checks: [boolean, string][] = [
		[
			header.format === DUMP_FORMAT,
			`Unrecognised dump format "${header.format}" (expected "${DUMP_FORMAT}").`,
		],
		[
			header.version === DUMP_VERSION,
			`Unsupported dump version ${header.version} (this build restores version ${DUMP_VERSION}).`,
		],
		[tables.length > 0, "Dump header lists no tables; cannot restore."],
		[!missing, `Invalid dump: missing data section for "${missing}".`],
	];
	const failure = checks.find(([ok]) => !ok);
	if (failure) throw new Error(failure[1]);
}
