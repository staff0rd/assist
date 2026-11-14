import type { PendingRuleChange, RuleEntry } from "../../../../../rules/types";

export function pendingChangeFor(
	changes: PendingRuleChange[],
	scopeId: string,
	rule: RuleEntry,
): PendingRuleChange | undefined {
	return changes.find(
		({ change }) =>
			change.scopeId === scopeId &&
			change.rule.code === rule.code &&
			change.rule.title === rule.title &&
			change.rule.text === rule.text,
	);
}
