import type { ReviewerResult } from "./runStreamingChild";

export function printReviewerFailures(results: ReviewerResult[]): void {
	for (const r of results) {
		if (r.exitCode === 0) continue;
		console.error(`[${r.name}] exited with code ${r.exitCode}`);
		if (r.stderr) console.error(r.stderr.trim());
	}
}
