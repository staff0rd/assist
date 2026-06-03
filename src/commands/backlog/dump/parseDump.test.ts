import { describe, expect, it } from "vitest";
import { buildDump } from "./buildDump";
import { countCopyRows } from "./countCopyRows";
import { DUMP_FORMAT, DUMP_TABLES, DUMP_VERSION } from "./DumpTable";
import { parseDump } from "./parseDump";
import { validateDump } from "./validateDump";

/** A realistic per-table payload set for round-trip assertions. */
const payloads: Record<string, Buffer> = {
	items: Buffer.from(
		"1\ttest\tstory\tName\t\\N\t[]\ttodo\t\\N\n2\ttest\tstory\tOther\t\\N\t[]\ttodo\t\\N\n",
		"utf8",
	),
	comments: Buffer.from("", "utf8"),
	metadata: Buffer.from("schema\t{embedded\ttab}\n", "utf8"),
};

const buildFixture = () =>
	buildDump(async (table) => payloads[table.name] ?? Buffer.alloc(0));

describe("parseDump", () => {
	it("recovers the header and every table payload verbatim", async () => {
		const { header, sections } = parseDump(await buildFixture());

		expect(header.format).toBe(DUMP_FORMAT);
		expect(header.version).toBe(DUMP_VERSION);
		expect([...sections.keys()]).toEqual(DUMP_TABLES.map((t) => t.name));
		for (const { name } of DUMP_TABLES) {
			const expected = payloads[name] ?? Buffer.alloc(0);
			expect(sections.get(name)?.equals(expected)).toBe(true);
		}
	});

	it("throws on a missing header line", () => {
		expect(() => parseDump(Buffer.from("no newline here", "utf8"))).toThrow(
			/missing newline/,
		);
	});

	it("throws on a non-JSON header", () => {
		expect(() => parseDump(Buffer.from("not json\n", "utf8"))).toThrow(
			/not valid JSON/,
		);
	});

	it("throws when a section overruns the dump", () => {
		const dump = Buffer.from(`{"format":"x"}\n@table items 999\nshort`, "utf8");
		expect(() => parseDump(dump)).toThrow(/overruns/);
	});
});

describe("validateDump", () => {
	it("accepts a dump matching this build's format, version and tables", async () => {
		const parsed = parseDump(await buildFixture());
		expect(() => validateDump(parsed)).not.toThrow();
	});

	it("rejects an unknown format", () => {
		expect(() =>
			validateDump({
				header: { format: "other", version: DUMP_VERSION, tables: DUMP_TABLES },
				sections: new Map(),
			}),
		).toThrow(/Unrecognised dump format/);
	});

	it("rejects an unsupported version", () => {
		expect(() =>
			validateDump({
				header: { format: DUMP_FORMAT, version: 99, tables: DUMP_TABLES },
				sections: new Map(),
			}),
		).toThrow(/Unsupported dump version/);
	});

	it("rejects a mismatched table set", () => {
		expect(() =>
			validateDump({
				header: {
					format: DUMP_FORMAT,
					version: DUMP_VERSION,
					tables: [{ name: "items", columns: ["id"] }],
				},
				sections: new Map([["items", Buffer.alloc(0)]]),
			}),
		).toThrow(/table set does not match/);
	});

	it("rejects a dump missing a data section", async () => {
		const parsed = parseDump(await buildFixture());
		parsed.sections.delete("links");
		expect(() => validateDump(parsed)).toThrow(
			/missing data section for "links"/,
		);
	});
});

describe("countCopyRows", () => {
	it("counts newline-terminated rows and treats empty payloads as zero", () => {
		expect(countCopyRows(payloads.items)).toBe(2);
		expect(countCopyRows(payloads.comments)).toBe(0);
		expect(countCopyRows(payloads.metadata)).toBe(1);
	});
});
