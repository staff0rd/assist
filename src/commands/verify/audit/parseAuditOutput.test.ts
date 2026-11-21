import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseAuditOutput } from "./parseAuditOutput";

const fixture = (name: string) =>
	readFileSync(path.join(__dirname, "fixtures", name), "utf8");

describe("parseAuditOutput", () => {
	it("normalises pnpm advisories", () => {
		const advisories = parseAuditOutput(fixture("pnpmAudit.json"));
		expect(advisories).toHaveLength(4);
		expect(advisories).toContainEqual({
			id: "GHSA-7589-6fvf-x4pw",
			packageName: "effect",
			severity: "high",
			title: expect.any(String),
			paths: [".>skott>effect"],
			patched: ">=3.22.1",
		});
		const minimatch = advisories?.find((a) => a.packageName === "minimatch");
		expect(minimatch?.paths).toContain(".>skott>depcheck>minimatch");
	});

	it("normalises npm advisories and traces transitive paths", () => {
		const advisories = parseAuditOutput(fixture("npmAudit.json"));
		const critical = advisories?.find((a) => a.id === "GHSA-xvch-5gv4-984h");
		expect(critical).toEqual({
			id: "GHSA-xvch-5gv4-984h",
			packageName: "minimist",
			severity: "critical",
			title: "Prototype Pollution in minimist",
			paths: ["mkdirp>minimist"],
			patched: "outside <0.2.4",
		});
		const lodash = advisories?.filter((a) => a.packageName === "lodash");
		expect(lodash?.map((a) => a.paths)).toEqual(lodash?.map(() => ["lodash"]));
		expect(new Set(advisories?.map((a) => a.id)).size).toBe(advisories?.length);
	});

	it("returns an empty list for a clean report", () => {
		expect(parseAuditOutput('{"advisories":{},"metadata":{}}')).toEqual([]);
		expect(
			parseAuditOutput('{"auditReportVersion":2,"vulnerabilities":{}}'),
		).toEqual([]);
	});

	it("returns undefined when the audit could not run", () => {
		expect(parseAuditOutput("")).toBeUndefined();
		expect(parseAuditOutput("ERR_PNPM_AUDIT_BAD_RESPONSE")).toBeUndefined();
		expect(
			parseAuditOutput('{"error":{"code":"ENOTFOUND","summary":"offline"}}'),
		).toBeUndefined();
		expect(parseAuditOutput('{"message":"nope"}')).toBeUndefined();
	});
});
