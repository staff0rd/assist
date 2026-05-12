import { type ParsedFinding, parseFindings } from "./parseFindings";
import {
	formatSynthesisSummary,
	summariseSynthesis,
} from "./summariseSynthesis";

function formatFindingLine(finding: ParsedFinding): string {
	const severity = finding.severity ?? "finding";
	return `- **${severity}: ${finding.title}**`;
}

export function buildReviewSummary(markdown: string): string {
	const summary = summariseSynthesis(markdown);
	const findings = parseFindings(markdown);
	const lines = ["## Code review summary", "", formatSynthesisSummary(summary)];
	if (findings.length > 0) {
		lines.push("", "### Findings", "");
		for (const finding of findings) lines.push(formatFindingLine(finding));
	}
	return lines.join("\n");
}
