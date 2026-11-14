import type { RuleScope } from "../../../../../rules/types";

export function scopeGroup(scope: RuleScope): string {
	return scope.kind === "user-db" || scope.kind === "user-node"
		? "Everywhere"
		: "This repo";
}
