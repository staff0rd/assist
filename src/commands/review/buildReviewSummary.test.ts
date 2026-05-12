import { describe, expect, it } from "vitest";
import { buildReviewSummary } from "./buildReviewSummary";

const SAMPLE = `# Code review synthesis

## Summary

The change adds X. One blocker around null handling and a few minors.

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
`;

describe("buildReviewSummary", () => {
	it("includes the count line, summary text, and a finding bullet per finding", () => {
		const out = buildReviewSummary(SAMPLE);
		expect(out).toContain("## Code review summary");
		expect(out).toContain("Findings: 2 (blocker 1, major 0, minor 1, nit 0)");
		expect(out).toContain("The change adds X.");
		expect(out).toContain("### Findings");
		expect(out).toContain("- **blocker: Null pointer dereference**");
		expect(out).toContain("- **minor: Missing log**");
	});

	it("omits the findings section when there are none", () => {
		const out = buildReviewSummary("## Summary\n\nNothing to flag.\n");
		expect(out).toContain("Nothing to flag.");
		expect(out).not.toContain("### Findings");
	});

	it("falls back to 'finding' when severity is missing or unknown", () => {
		const md =
			"## Summary\n\nx\n\n### Finding: weird\n- Severity: weird\n- Location: `n/a`\n";
		expect(buildReviewSummary(md)).toContain("- **finding: weird**");
	});
});
