import { describe, expect, it } from "vitest";
import { buildDump } from "./buildDump";
import { DUMP_FORMAT, DUMP_VERSION, type DumpTable } from "./DumpTable";

const TABLES: DumpTable[] = [
	{ name: "items", columns: ["id", "origin", "name"] },
	{ name: "comments", columns: ["id", "item_id", "text"] },
	{ name: "usage_peaks", columns: ['"window"', "resets_at"] },
	{ name: "metadata", columns: ["key", "value"] },
];

/** Split a dump buffer into its JSON header and a list of table sections. */
function parseDump(dump: Buffer): {
	header: { format: string; version: number; tables: DumpTable[] };
	sections: { name: string; data: Buffer }[];
} {
	const newline = dump.indexOf(0x0a);
	const header = JSON.parse(dump.subarray(0, newline).toString("utf8"));
	const sections: { name: string; data: Buffer }[] = [];
	let cursor = newline + 1;
	while (cursor < dump.length) {
		const eol = dump.indexOf(0x0a, cursor);
		const [, name, bytes] = dump
			.subarray(cursor, eol)
			.toString("utf8")
			.match(/^@table (\S+) (\d+)$/) as RegExpMatchArray;
		const start = eol + 1;
		const length = Number(bytes);
		sections.push({ name, data: dump.subarray(start, start + length) });
		cursor = start + length;
	}
	return { header, sections };
}

describe("buildDump", () => {
	it("writes a versioned header describing exactly the introspected tables", async () => {
		const dump = await buildDump(TABLES, async () => Buffer.alloc(0));
		const { header } = parseDump(dump);

		expect(header.format).toBe(DUMP_FORMAT);
		expect(header.version).toBe(DUMP_VERSION);
		expect(header.tables).toEqual(TABLES);
	});

	it("frames each table's COPY data verbatim by byte length", async () => {
		const payloads: Record<string, Buffer> = {
			items: Buffer.from("1\ttest\tName\n", "utf8"),
			comments: Buffer.from("", "utf8"),
			metadata: Buffer.from("schema\t{embedded\ttab}\n", "utf8"),
		};
		const dump = await buildDump(
			TABLES,
			async (table) => payloads[table.name] ?? Buffer.alloc(0),
		);
		const { sections } = parseDump(dump);

		expect(sections.map((s) => s.name)).toEqual(TABLES.map((t) => t.name));
		for (const { name, data } of sections) {
			const expected = payloads[name] ?? Buffer.alloc(0);
			expect(data.equals(expected)).toBe(true);
		}
	});

	it("requests COPY data for each table once, in the given order", async () => {
		const seen: string[] = [];
		await buildDump(TABLES, async (table) => {
			seen.push(table.name);
			return Buffer.alloc(0);
		});
		expect(seen).toEqual(TABLES.map((t) => t.name));
	});
});
