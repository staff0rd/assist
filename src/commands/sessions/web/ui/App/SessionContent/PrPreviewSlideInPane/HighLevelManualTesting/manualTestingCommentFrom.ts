import type { HighLevelManualTesting } from "../../../../../../../review/highLevel/types";
import type { DiffComment } from "../../../formatDiffComment";
import { locateQuoteLines } from "../../../locateQuoteLines";

function located(
	path: string,
	lines: string[],
	quote: string,
	note: string,
): DiffComment | null {
	const at = locateQuoteLines(lines.join("\n"), quote);
	return at
		? { path, startLine: at.start, endLine: at.end, quote, note }
		: null;
}

export function manualTestingCommentFrom(
	manualTesting: HighLevelManualTesting,
	quote: string,
	note: string,
): DiffComment {
	const steps = manualTesting.steps.map(
		(step) => `${step.action}→${step.expect}`,
	);
	return (
		located("Manual testing step", steps, quote, note) ??
		located("Manual testing setup", manualTesting.setup, quote, note) ?? {
			path: "Manual testing",
			startLine: 1,
			endLine: 1,
			quote,
			note,
		}
	);
}
