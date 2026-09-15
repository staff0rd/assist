import { type AdviceContext, adviceConditions } from "./adviceConditions";
import type { AdviceFragment } from "./parseAdviceFragment";

type AdviceDecision = {
	fragment: AdviceFragment;
	included: boolean;
	reason: string;
};

export function selectAdvice(
	fragments: AdviceFragment[],
	context: AdviceContext,
): AdviceDecision[] {
	return fragments.map((fragment) => {
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
	});
}
