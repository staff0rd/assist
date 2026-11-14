import type { RuleChange } from "../../../rules/types";

export function sameRuleTarget(a: RuleChange, b: RuleChange): boolean {
	return (
		a.scopeId === b.scopeId &&
		a.rule.code === b.rule.code &&
		a.rule.title === b.rule.title &&
		a.rule.text === b.rule.text
	);
}
