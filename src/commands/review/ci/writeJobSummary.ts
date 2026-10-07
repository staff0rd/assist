import { appendFileSync, readFileSync } from "node:fs";
import { buildReviewSummary } from "../buildReviewSummary";
import type { PrDiffRef } from "../postReviewToPr";
import { selectPostableFindings } from "../selectPostableFindings";

export function writeJobSummary(
	synthesisPath: string,
	prInfo: PrDiffRef,
	summaryPath: string | undefined,
): void {
	if (!summaryPath) return;
	const markdown = readFileSync(synthesisPath, "utf8");
	const { unanchored } = selectPostableFindings(markdown, prInfo);
	appendFileSync(summaryPath, `${buildReviewSummary(markdown, unanchored)}\n`);
}
