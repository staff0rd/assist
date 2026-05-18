type SynthesisSummary = {
	summary: string;
	totals: { blocker: number; major: number; minor: number; nit: number };
	findingCount: number;
};

const SEVERITIES = ["blocker", "major", "minor", "nit"] as const;
type Severity = (typeof SEVERITIES)[number];

function isSeverity(value: string): value is Severity {
	return (SEVERITIES as readonly string[]).includes(value);
}

function extractSummary(markdown: string): string {
	const match = markdown.match(
		/^##\s+Summary\s*\n([\s\S]*?)(?=\n##\s|\n###\s|$)/m,
	);
	if (!match) return "";
	return match[1].trim();
}

function countBySeverity(markdown: string): SynthesisSummary["totals"] {
	const totals = { blocker: 0, major: 0, minor: 0, nit: 0 };
	const regex = /^-\s+Severity:\s*([a-zA-Z]+)/gm;
	for (const match of markdown.matchAll(regex)) {
		const severity = match[1].toLowerCase();
		if (isSeverity(severity)) totals[severity]++;
	}
	return totals;
}

export function summariseSynthesis(markdown: string): SynthesisSummary {
	const totals = countBySeverity(markdown);
	const findingCount =
		totals.blocker + totals.major + totals.minor + totals.nit;
	return { summary: extractSummary(markdown), totals, findingCount };
}

export function formatSynthesisSummary(summary: SynthesisSummary): string {
	const lines: string[] = [];
	const { totals, findingCount } = summary;
	lines.push(
		`Findings: ${findingCount} (blocker ${totals.blocker}, major ${totals.major}, minor ${totals.minor}, nit ${totals.nit})`,
	);
	if (summary.summary) lines.push("", summary.summary);
	return lines.join("\n");
}
