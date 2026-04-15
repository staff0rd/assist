import * as fs from "node:fs";

/**
 * Read a .summary sidecar file for a session JSONL.
 * Returns the summary string, or undefined if no summary exists.
 */
export function readSummary(jsonlPath: string): string | undefined {
	const summaryPath = summaryPathFor(jsonlPath);
	try {
		return fs.readFileSync(summaryPath, "utf8").trim() || undefined;
	} catch {
		return undefined;
	}
}

/**
 * Write a .summary sidecar file next to a session JSONL.
 */
export function writeSummary(jsonlPath: string, summary: string): void {
	fs.writeFileSync(summaryPathFor(jsonlPath), `${summary.trim()}\n`, "utf8");
}

/**
 * Check whether a summary already exists for the given session JSONL.
 */
export function hasSummary(jsonlPath: string): boolean {
	return fs.existsSync(summaryPathFor(jsonlPath));
}

/**
 * Derive the .summary path from a .jsonl path.
 * e.g. /path/to/session-id.jsonl → /path/to/session-id.summary
 */
export function summaryPathFor(jsonlPath: string): string {
	return jsonlPath.replace(/\.jsonl$/, ".summary");
}
