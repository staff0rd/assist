import type { AdviceContext } from "./adviceConditions";
import { loadAdviceFragments } from "./loadAdviceFragments";
import type { AdviceFragment } from "./parseAdviceFragment";
import { selectAdvice } from "./selectAdvice";

const heading = "# Instructions for this repo (composed by assist)";

export function composeAdvice(
	context: AdviceContext,
	fragments: AdviceFragment[] = loadAdviceFragments(),
): string {
	const sections = selectAdvice(fragments, context)
		.filter((decision) => decision.included)
		.map(({ fragment }) => `## ${fragment.title}\n\n${fragment.body}`);
	if (sections.length === 0) return "";
	return [heading, ...sections].join("\n\n");
}
