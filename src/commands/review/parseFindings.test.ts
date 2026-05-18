import { describe, expect, it } from "vitest";
import { parseFindings } from "./parseFindings";
import { partitionFindings } from "./partitionFindings";

const SAMPLE = `# Code review synthesis

## Summary

Overall summary.

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

describe("parseFindings", () => {
	it("parses each finding block", () => {
		const findings = parseFindings(SAMPLE);
		expect(findings).toHaveLength(3);
		expect(findings[0]).toEqual({
			title: "Null pointer dereference",
			severity: "blocker",
			source: "confirmed",
			location: "src/foo.ts:42",
			impact: "Crash on null input.",
			recommendation: "Add a null guard.",
		});
	});

	it("normalises severity casing and drops unknown severities", () => {
		const md = `### Finding: weird\n- Severity: CATASTROPHIC\n- Location: \`n/a\`\n`;
		const findings = parseFindings(md);
		expect(findings[0].severity).toBeNull();
	});

	it("recognises already-raised as a valid source", () => {
		const md = `### Finding: duplicate\n- Severity: minor\n- Source: already-raised\n- Location: \`src/foo.ts:42\`\n`;
		const findings = parseFindings(md);
		expect(findings[0].source).toBe("already-raised");
	});

	it("drops unknown source values", () => {
		const md = `### Finding: weird\n- Severity: minor\n- Source: mystery\n- Location: \`n/a\`\n`;
		const findings = parseFindings(md);
		expect(findings[0].source).toBeNull();
	});

	it("returns empty array when no findings present", () => {
		expect(parseFindings("## Summary\n\nNo findings.\n")).toEqual([]);
	});
});

describe("partitionFindings", () => {
	it("splits line-bound from unlocated findings", () => {
		const { lineBound, unlocated } = partitionFindings(parseFindings(SAMPLE));
		expect(lineBound).toHaveLength(2);
		expect(unlocated).toHaveLength(1);
		expect(lineBound[0]).toMatchObject({
			file: "src/foo.ts",
			line: 42,
		});
		expect(lineBound[1]).toMatchObject({
			file: "src/bar.ts",
			line: 10,
		});
		expect(unlocated[0].title).toBe("Missing log");
	});

	it("treats n/a (any case) as unlocated", () => {
		const md = `### Finding: a\n- Severity: minor\n- Location: \`N/A\`\n`;
		const { lineBound, unlocated } = partitionFindings(parseFindings(md));
		expect(lineBound).toHaveLength(0);
		expect(unlocated).toHaveLength(1);
	});

	it("treats missing line numbers as unlocated", () => {
		const md = `### Finding: a\n- Severity: minor\n- Location: \`src/foo.ts\`\n`;
		const { lineBound, unlocated } = partitionFindings(parseFindings(md));
		expect(lineBound).toHaveLength(0);
		expect(unlocated).toHaveLength(1);
	});

	it("captures line ranges as multi-line bounds", () => {
		const md = `### Finding: range\n- Severity: minor\n- Location: \`src/foo.ts:95-107\`\n`;
		const { lineBound } = partitionFindings(parseFindings(md));
		expect(lineBound).toHaveLength(1);
		expect(lineBound[0]).toMatchObject({
			file: "src/foo.ts",
			line: 107,
			startLine: 95,
		});
	});

	it("collapses a degenerate range (N-N) to single line", () => {
		const md = `### Finding: same\n- Severity: minor\n- Location: \`src/foo.ts:42-42\`\n`;
		const { lineBound } = partitionFindings(parseFindings(md));
		expect(lineBound[0].line).toBe(42);
		expect(lineBound[0].startLine).toBeUndefined();
	});

	it("rejects reversed ranges", () => {
		const md = `### Finding: bad\n- Severity: minor\n- Location: \`src/foo.ts:50-10\`\n`;
		const { lineBound, unlocated } = partitionFindings(parseFindings(md));
		expect(lineBound).toHaveLength(0);
		expect(unlocated).toHaveLength(1);
	});

	it("handles a refined synthesis (dropped + edited + appended findings)", () => {
		const refined = `# Code review synthesis

## Summary

Overall summary.

## Findings

### Finding: Null pointer dereference (clarified)
- Severity: major
- Source: confirmed
- Location: \`src/foo.ts:42\`
- Impact: Crash on null input from upstream caller.
- Recommendation: Add a null guard and log when triggered.

### Finding: Style nit
- Severity: nit
- Source: codex-only
- Location: \`src/bar.ts:10\`
- Impact: Inconsistent with codebase.
- Recommendation: Rename variable.

### Finding: User-spotted missing test
- Severity: minor
- Source: confirmed
- Location: \`src/baz.ts:7\`
- Impact: Regression slipped through CI.
- Recommendation: Add a test covering the empty-input path.
`;
		const { lineBound, unlocated, alreadyRaised } = partitionFindings(
			parseFindings(refined),
		);
		expect(unlocated).toHaveLength(0);
		expect(alreadyRaised).toHaveLength(0);
		expect(lineBound).toHaveLength(3);
		expect(lineBound.map((f) => f.title)).toEqual([
			"Null pointer dereference (clarified)",
			"Style nit",
			"User-spotted missing test",
		]);
		expect(lineBound[0]).toMatchObject({
			severity: "major",
			file: "src/foo.ts",
			line: 42,
			impact: "Crash on null input from upstream caller.",
		});
		expect(lineBound[2]).toMatchObject({
			source: "confirmed",
			file: "src/baz.ts",
			line: 7,
		});
	});

	it("handles a post-apply synthesis (applied blocks removed, skipped retained)", () => {
		const postApply = `# Code review synthesis

## Summary

Overall summary.

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

### Finding: Duplicate of prior comment
- Severity: minor
- Source: already-raised
- Location: \`src/qux.ts:5\`
- Impact: Already flagged in a prior review.
- Recommendation: No new action.
`;
		const { lineBound, unlocated, alreadyRaised } = partitionFindings(
			parseFindings(postApply),
		);
		expect(lineBound).toHaveLength(1);
		expect(unlocated).toHaveLength(1);
		expect(alreadyRaised).toHaveLength(1);
		expect(lineBound[0]).toMatchObject({
			title: "Null pointer dereference",
			file: "src/foo.ts",
			line: 42,
		});
		expect(unlocated[0].title).toBe("Missing log");
		expect(alreadyRaised[0].title).toBe("Duplicate of prior comment");
	});

	it("separates already-raised findings regardless of location", () => {
		const md = `### Finding: dup with line
- Severity: minor
- Source: already-raised
- Location: \`src/foo.ts:42\`

### Finding: dup without line
- Severity: minor
- Source: already-raised
- Location: \`n/a\`

### Finding: fresh
- Severity: minor
- Source: claude-only
- Location: \`src/bar.ts:10\`
`;
		const { lineBound, unlocated, alreadyRaised } = partitionFindings(
			parseFindings(md),
		);
		expect(alreadyRaised).toHaveLength(2);
		expect(lineBound).toHaveLength(1);
		expect(unlocated).toHaveLength(0);
		expect(lineBound[0]).toMatchObject({ file: "src/bar.ts", line: 10 });
	});
});
