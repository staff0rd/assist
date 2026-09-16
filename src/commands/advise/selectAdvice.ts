import type { AdviceContext } from "./AdviceContext";
import { adviceConditions } from "./adviceConditions";
import type { AdviceFragment } from "./parseAdviceFragment";

type AdviceDecision = {
	fragment: AdviceFragment;
	included: boolean;
	reason: string;
};

function decide(
	fragment: AdviceFragment,
	context: AdviceContext,
): AdviceDecision {
	const advice = context.config.advice;
	if (advice?.exclude.includes(fragment.name))
		return { fragment, included: false, reason: "excluded by advice.exclude" };
	if (advice?.include.includes(fragment.name))
		return { fragment, included: true, reason: "included by advice.include" };

	const condition = adviceConditions[fragment.when];
	if (!condition)
		return {
			fragment,
			included: false,
			reason: `unknown condition "${fragment.when}"`,
		};

	const included = condition.matches(context);
	return {
		fragment,
		included,
		reason: included ? condition.whenMet : condition.whenUnmet,
	};
}

export function selectAdvice(
	fragments: AdviceFragment[],
	context: AdviceContext,
): AdviceDecision[] {
	return fragments.map((fragment) => decide(fragment, context));
}
