import {
	DUMP_FORMAT,
	DUMP_TABLES,
	DUMP_VERSION,
	type DumpTable,
} from "./DumpTable";

/** Produces the raw COPY ... TO STDOUT bytes for one table. */
type CopyOut = (table: DumpTable) => Promise<Buffer>;

/**
 * Assemble a self-contained, versioned dump of the backlog tables.
 *
 * Layout (UTF-8):
 *   - line 1: a JSON header `{ format, version, tables: [{ name, columns }] }`
 *   - then, per table in {@link DUMP_TABLES} order, a section:
 *       `@table <name> <byteLength>\n`
 *       followed by exactly `<byteLength>` bytes of raw COPY text data.
 *
 * Byte-length framing makes the container robust regardless of the COPY
 * payload's contents, and keeps each table's data verbatim for a faithful
 * round-trip on import.
 */
export async function buildDump(copyOut: CopyOut): Promise<Buffer> {
	const header = JSON.stringify({
		format: DUMP_FORMAT,
		version: DUMP_VERSION,
		tables: DUMP_TABLES.map(({ name, columns }) => ({ name, columns })),
	});
	const parts: Buffer[] = [Buffer.from(`${header}\n`, "utf8")];
	for (const table of DUMP_TABLES) {
		const data = await copyOut(table);
		parts.push(Buffer.from(`@table ${table.name} ${data.length}\n`, "utf8"));
		parts.push(data);
	}
	return Buffer.concat(parts);
}
