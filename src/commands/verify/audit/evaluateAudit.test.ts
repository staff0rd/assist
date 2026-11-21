import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateAudit } from "./evaluateAudit";
import { formatAuditReport } from "./formatAuditReport";
import { parseAuditOutput } from "./parseAuditOutput";
import type { Severity } from "./severities";

const advisories =
	parseAuditOutput(
		readFileSync(path.join(__dirname, "fixtures", "pnpmAudit.json"), "utf8"),
	) ?? [];

describe("evaluateAudit", () => {
	it("fails on high and critical by default", () => {
		const result = evaluateAudit(advisories, "high", []);
		expect(result.failing.map((a) => a.packageName)).toEqual(["effect"]);
		expect(result.belowLevel).toHaveLength(3);
	});

	it("passes when only advisories below the level remain", () => {
		const below = advisories.filter((a) => a.severity !== "high");
		expect(evaluateAudit(below, "high", []).failing).toEqual([]);
	});

	it("honours a lower configured level", () => {
		const result = evaluateAudit(advisories, "moderate", []);
		expect(result.failing.map((a) => a.packageName)).toEqual([
			"effect",
			"prismjs",
			"minimatch",
		]);
	});

	it.each([
		["low", ["effect", "prismjs", "minimatch", "esbuild"]],
		["moderate", ["effect", "prismjs", "minimatch"]],
		["high", ["effect"]],
		["critical", []],
	] as [Severity, string[]][])("fails at or above %s", (level, failing) => {
		const result = evaluateAudit(advisories, level, []);
		expect(result.failing.map((a) => a.packageName)).toEqual(failing);
		expect(result.belowLevel).toHaveLength(4 - failing.length);
	});

	it("skips ignored ids but keeps them visible", () => {
		const result = evaluateAudit(advisories, "high", ["ghsa-7589-6fvf-x4pw"]);
		expect(result.failing).toEqual([]);
		expect(result.ignored.map((a) => a.id)).toEqual(["GHSA-7589-6fvf-x4pw"]);
		const report = formatAuditReport(result, "high").join("\n");
		expect(report).toContain("Ignored advisories");
		expect(report).toContain("GHSA-7589-6fvf-x4pw");
	});
});

describe("formatAuditReport", () => {
	it("lists severity, package, id, path and patched range", () => {
		const report = formatAuditReport(
			evaluateAudit(advisories, "high", []),
			"high",
		).join("\n");
		expect(report).toContain("HIGH effect GHSA-7589-6fvf-x4pw");
		expect(report).toContain("path: .>skott>effect");
		expect(report).toContain("patched: >=3.22.1");
	});
});
