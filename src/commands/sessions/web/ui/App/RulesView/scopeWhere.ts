import type { RuleScope } from "../../../../../rules/types";

export function scopeWhere(scope: RuleScope): string | undefined {
	switch (scope.kind) {
		case "user-db":
			return "every repo, every node";
		case "user-node":
			return `this node only · ${scope.label ?? "~/.assist.yml"}`;
		case "repo-db":
			return `${scope.label ?? "this repo"}, every node`;
		case "claude-md":
			return undefined;
	}
}
