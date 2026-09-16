import type { AdviceContext } from "./AdviceContext";
import { loadAdviceFragments } from "./loadAdviceFragments";
import type { AdviceFragment } from "./parseAdviceFragment";
import { renderAdviceBody } from "./renderAdviceBody";
import { selectAdvice } from "./selectAdvice";

const heading = "# Instructions for this repo (composed by assist)";

export function composeAdvice(
	context: AdviceContext,
	fragments: AdviceFragment[] = loadAdviceFragments(),
): string {
	const sections = selectAdvice(fragments, context)
		.filter((decision) => decision.included)
		.map(
			({ fragment }) =>
				`## ${fragment.title}\n\n${renderAdviceBody(fragment, context)}`,
		);

	const extra = context.config.advice?.extra?.trim();
	if (extra) sections.push(`## Repo notes\n\n${extra}`);

	if (sections.length === 0) return "";
	return [heading, ...sections].join("\n\n");
}
