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
	const sections: Record<string, boolean | undefined> =
		context.config.advice?.sections ?? {};
	const override = sections[fragment.name];
	if (override !== undefined)
		return {
			fragment,
			included: override,
			reason: `advice.sections.${fragment.name} is ${override}`,
		};

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
