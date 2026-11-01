import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadDevWeeks, parseDevWeekFilename } from "./loadDevWeeks";

describe("parseDevWeekFilename", () => {
	it("maps an entry filename to its week id", () => {
		expect(parseDevWeekFilename("2026-w33.md")).toBe("2026-W33");
	});

	it("ignores other files", () => {
		expect(parseDevWeekFilename("2026-08-12-slug.md")).toBeNull();
		expect(parseDevWeekFilename("2026-w33.mdx")).toBeNull();
	});
});

describe("loadDevWeeks", () => {
	let devDir: string;

	beforeEach(() => {
		devDir = mkdtempSync(join(tmpdir(), "dev-weeks-"));
	});

	afterEach(() => {
		rmSync(devDir, { recursive: true, force: true });
	});

	it("returns the repo's weeks sorted, last being the latest", () => {
		mkdirSync(join(devDir, "assist"));
		for (const name of ["2027-w01.md", "2026-w52.md", "2026-w09.md", "x.md"]) {
			writeFileSync(join(devDir, "assist", name), "");
		}
		mkdirSync(join(devDir, "other"));
		writeFileSync(join(devDir, "other", "2027-w05.md"), "");

		expect(loadDevWeeks("assist", devDir)).toEqual([
			"2026-W09",
			"2026-W52",
			"2027-W01",
		]);
	});

	it("returns nothing when the repo has no entries", () => {
		expect(loadDevWeeks("missing", devDir)).toEqual([]);
	});
});
