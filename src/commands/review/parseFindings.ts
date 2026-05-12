type Severity = "blocker" | "major" | "minor" | "nit";

export type ParsedFinding = {
	title: string;
	severity: Severity | null;
	source: string | null;
	location: string;
	impact: string;
	recommendation: string;
};

const SEVERITIES: readonly Severity[] = ["blocker", "major", "minor", "nit"];

function isSeverity(value: string): value is Severity {
	return (SEVERITIES as readonly string[]).includes(value);
}

function extractField(block: string, field: string): string {
	const re = new RegExp(`^-\\s+${field}:\\s*(.*)$`, "im");
	const match = block.match(re);
	return match ? match[1].trim() : "";
}

function stripBackticks(value: string): string {
	return value.replace(/^`+|`+$/g, "").trim();
}

function parseFindingBlock(block: string): ParsedFinding {
	const newlineIndex = block.indexOf("\n");
	const title =
		newlineIndex === -1 ? block.trim() : block.slice(0, newlineIndex).trim();
	const body = newlineIndex === -1 ? "" : block.slice(newlineIndex + 1);
	const severityRaw = extractField(body, "Severity").toLowerCase();
	const sourceRaw = extractField(body, "Source").toLowerCase();
	return {
		title,
		severity: isSeverity(severityRaw) ? severityRaw : null,
		source: sourceRaw === "" ? null : sourceRaw,
		location: stripBackticks(extractField(body, "Location")),
		impact: extractField(body, "Impact"),
		recommendation: extractField(body, "Recommendation"),
	};
}

export function parseFindings(markdown: string): ParsedFinding[] {
	return markdown
		.split(/^###\s+Finding:\s*/m)
		.slice(1)
		.map(parseFindingBlock);
}
