import type { RuleScope } from "../../../../../rules/types";

export function addRuleFlag(scope: RuleScope): string | undefined {
	if (scope.kind === "user-db") return "--user";
	if (scope.kind === "user-node") return "--node";
	if (scope.kind === "repo-db")
		return scope.label ? `--repo ${scope.label}` : "--repo";
	return undefined;
}
