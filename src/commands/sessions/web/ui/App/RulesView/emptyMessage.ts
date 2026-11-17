import type { RuleScope } from "../../../../../rules/types";
import { addRuleFlag } from "./addRuleFlag";

export function emptyMessage(scope: RuleScope): string {
	if (scope.error) return `Couldn't read ${scope.name}: ${scope.error}`;
	if (addRuleFlag(scope))
		return "No rules here yet. Use Add rule to write the first one.";
	return "No rules here yet. Rules added with /add-rule for this scope will show up here.";
}
