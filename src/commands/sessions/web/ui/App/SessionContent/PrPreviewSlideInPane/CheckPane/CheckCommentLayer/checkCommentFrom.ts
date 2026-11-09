import type { AskCheckInput } from "../../../../../../../shared/askCheckInputSchema";
import type { DiffComment } from "../../../../formatDiffComment";
import { locateQuoteLines } from "../../../../locateQuoteLines";
import { inlinePlainText } from "./inlinePlainText";

function where(check: AskCheckInput, quote: string) {
	const sections: [string, string[]][] = [
		["step", check.steps],
		["setup chip", check.before ?? []],
		["what changed", check.changed ? [check.changed] : []],
	];
	for (const [label, items] of sections) {
		const at = locateQuoteLines(items.map(inlinePlainText).join("\n"), quote);
		if (at) return { label, startLine: at.start, endLine: at.end };
	}
	return { label: "check", startLine: 1, endLine: 1 };
}

export function checkCommentFrom(
	check: AskCheckInput,
	quote: string,
	question: string,
): DiffComment {
	const { label, startLine, endLine } = where(check, quote);
	return {
		path: `Pending manual check "${check.title}", ${label}`,
		startLine,
		endLine,
		quote,
		note: `Question about this pending manual check (answer it, then keep waiting on the check): ${question}`,
	};
}
