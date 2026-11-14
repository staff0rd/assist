import type { RuleWritePlan } from "./RulePlanContext";
import type { RuleEntry } from "./types";

export function changedSince(rule: RuleEntry, name: string): RuleWritePlan {
	const label = rule.code ?? rule.title ?? rule.text;
	return {
		ok: false,
		error: `${label} in ${name} has changed since it was shown; reload the Rules page and try again`,
	};
}
