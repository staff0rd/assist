import type { RuleScope } from "../../../../../rules/types";

export function emptyMessage(scope: RuleScope): string {
	if (scope.error) return `Couldn't read ${scope.name}: ${scope.error}`;
	return "No rules here yet. Use Add rule to write the first one.";
}
