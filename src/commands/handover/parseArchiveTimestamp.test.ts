import { describe, expect, it } from "vitest";
import { parseArchiveTimestamp } from "./parseArchiveTimestamp";

describe("parseArchiveTimestamp", () => {
	it("parses a UTC archive timestamp", () => {
		expect(parseArchiveTimestamp("2026-05-25T143022Z.md")).toEqual(
			new Date(Date.UTC(2026, 4, 25, 14, 30, 22)),
		);
	});

	it("ignores a trailing suffix", () => {
		expect(parseArchiveTimestamp("2026-01-05T030709Z-manual.md")).toEqual(
			new Date(Date.UTC(2026, 0, 5, 3, 7, 9)),
		);
	});

	it("returns undefined for names without a timestamp prefix", () => {
		expect(parseArchiveTimestamp("notes.md")).toBeUndefined();
	});
});
