import { describe, expect, it } from "vitest";
import {
	formatSynthesisSummary,
	summariseSynthesis,
} from "./summariseSynthesis";

const SAMPLE = `# Code review synthesis

## Summary

The change adds X. There is one blocker around null handling and a few stylistic minors.

## Findings

### Finding: Null pointer dereference
- Severity: blocker
- Source: confirmed
- Location: \`src/foo.ts:42\`
- Impact: Crash on null input.
- Recommendation: Add a null guard.

### Finding: Missing log
- Severity: minor
- Source: claude-only
- Location: \`n/a\`
- Impact: Harder to debug.
- Recommendation: Add a debug log.

### Finding: Style nit
- Severity: nit
- Source: codex-only
- Location: \`src/bar.ts:10\`
- Impact: Inconsistent with codebase.
- Recommendation: Rename variable.
`;

describe("summariseSynthesis", () => {
	it("extracts the summary section text", () => {
		const result = summariseSynthesis(SAMPLE);
		expect(result.summary).toBe(
			"The change adds X. There is one blocker around null handling and a few stylistic minors.",
		);
	});

	it("counts findings by severity", () => {
		const result = summariseSynthesis(SAMPLE);
		expect(result.totals).toEqual({
			blocker: 1,
			major: 0,
			minor: 1,
			nit: 1,
		});
		expect(result.findingCount).toBe(3);
	});

	it("returns zero counts and empty summary for empty input", () => {
		const result = summariseSynthesis("");
		expect(result.findingCount).toBe(0);
		expect(result.summary).toBe("");
		expect(result.totals).toEqual({ blocker: 0, major: 0, minor: 0, nit: 0 });
	});

	it("ignores unknown severity values", () => {
		const md = `## Summary\n\nx\n\n### Finding: weird\n- Severity: catastrophic\n- Location: \`n/a\`\n`;
		const result = summariseSynthesis(md);
		expect(result.findingCount).toBe(0);
	});
});

describe("formatSynthesisSummary", () => {
	it("formats counts and summary into a console-friendly string", () => {
		const result = summariseSynthesis(SAMPLE);
		const text = formatSynthesisSummary(result);
		expect(text).toContain("Findings: 3 (blocker 1, major 0, minor 1, nit 1)");
		expect(text).toContain("The change adds X.");
	});

	it("omits the summary line when synthesis has no summary", () => {
		const text = formatSynthesisSummary({
			summary: "",
			totals: { blocker: 0, major: 0, minor: 0, nit: 0 },
			findingCount: 0,
		});
		expect(text).toBe("Findings: 0 (blocker 0, major 0, minor 0, nit 0)");
	});
});
