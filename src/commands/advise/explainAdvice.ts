import chalk from "chalk";
import type { AdviceContext } from "./AdviceContext";
import { loadAdviceFragments } from "./loadAdviceFragments";
import type { AdviceFragment } from "./parseAdviceFragment";
import { selectAdvice } from "./selectAdvice";

export function explainAdvice(
	context: AdviceContext,
	fragments: AdviceFragment[] = loadAdviceFragments(),
): string {
	const decisions = selectAdvice(fragments, context);
	const width = Math.max(
		...decisions.map((decision) => decision.fragment.name.length),
	);

	return decisions
		.map(
			({ fragment, included, reason }) =>
				`${included ? chalk.green("✓") : chalk.dim("✗")} ${fragment.name.padEnd(width)}  ${reason}`,
		)
		.join("\n");
}
