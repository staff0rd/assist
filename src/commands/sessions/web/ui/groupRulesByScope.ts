import type { ScopedRule } from "../../../rules/types";

export type RuleScope = {
	source: string;
	rules: ScopedRule[];
};

export function groupRulesByScope(rules: ScopedRule[]): RuleScope[] {
	const scopes: RuleScope[] = [];

	for (const rule of rules) {
		const last = scopes.at(-1);
		if (last?.source === rule.source) last.rules.push(rule);
		else scopes.push({ source: rule.source, rules: [rule] });
	}

	return scopes;
}
