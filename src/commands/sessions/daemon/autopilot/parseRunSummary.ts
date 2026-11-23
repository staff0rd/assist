import type { AutopilotRunSummary } from "./AutopilotRecord";

const FIELDS = ["checked", "decided", "started", "next"] as const;

export function parseRunSummary(value: unknown): AutopilotRunSummary | string {
	if (!value || typeof value !== "object")
		return "summary needs checked, decided, started and next";
	const record = value as Record<string, unknown>;
	const summary: Partial<AutopilotRunSummary> = {};
	for (const field of FIELDS) {
		const text = record[field];
		if (typeof text !== "string" || !text.trim())
			return `summary needs a non-empty ${field}`;
		if (text.includes("\n")) return `${field} must be one line`;
		summary[field] = text.trim();
	}
	return summary as AutopilotRunSummary;
}
