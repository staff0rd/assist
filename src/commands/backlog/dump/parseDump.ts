import type { DumpTable } from "./DumpTable";

/** The JSON header written on line 1 of every dump. */
type DumpHeader = {
	format: string;
	version: number;
	tables: DumpTable[];
};

/** A parsed dump: its header plus each table's verbatim COPY payload. */
export type ParsedDump = {
	header: DumpHeader;
	sections: Map<string, Buffer>;
};

const NEWLINE = 0x0a;

/** Throw a uniformly-prefixed parse error. */
function invalid(reason: string): never {
	throw new Error(`Invalid dump: ${reason}`);
}

/** Read the newline-terminated line at `start`; return its text and the next offset. */
function readLine(dump: Buffer, start: number): { text: string; next: number } {
	const eol = dump.indexOf(NEWLINE, start);
	if (eol === -1) invalid("truncated line (missing newline).");
	return { text: dump.subarray(start, eol).toString("utf8"), next: eol + 1 };
}

/** Decode the line-1 JSON header, returning it and the offset where the body begins. */
function parseHeader(dump: Buffer): { header: DumpHeader; bodyStart: number } {
	const { text, next } = readLine(dump, 0);
	try {
		return { header: JSON.parse(text), bodyStart: next };
	} catch {
		return invalid("header is not valid JSON.");
	}
}

/** Read each `@table <name> <byteLength>` section's payload verbatim into a map. */
function parseSections(dump: Buffer, bodyStart: number): Map<string, Buffer> {
	const sections = new Map<string, Buffer>();
	let cursor = bodyStart;
	while (cursor < dump.length) {
		const { text, next } = readLine(dump, cursor);
		const match = text.match(/^@table (\S+) (\d+)$/);
		if (!match) invalid(`malformed table marker "${text}".`);
		const [, name, bytes] = match;
		const end = next + Number(bytes);
		if (end > dump.length) invalid(`section "${name}" overruns the dump.`);
		sections.set(name, dump.subarray(next, end));
		cursor = end;
	}
	return sections;
}

/**
 * Parse a dump buffer produced by `buildDump` back into its header and per-table
 * COPY payloads. Reads sections sequentially using the byte-length framing, so
 * payloads are recovered verbatim regardless of contents. Throws a descriptive
 * error on any structural malformation.
 */
export function parseDump(dump: Buffer): ParsedDump {
	const { header, bodyStart } = parseHeader(dump);
	return { header, sections: parseSections(dump, bodyStart) };
}
