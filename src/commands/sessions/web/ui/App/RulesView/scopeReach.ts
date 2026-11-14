import type { RuleScope } from "../../../../../rules/types";

export function scopeReach(scope: RuleScope): string {
	switch (scope.kind) {
		case "user-db":
			return "Applies to every session in every repo on every node.";
		case "user-node":
			return "Applies to every repo, on this node only.";
		case "repo-db":
			return `Applies to every session in ${scope.label ?? "this repo"}, on every node.`;
		case "claude-md":
			return scope.dir
				? `Applies under ${scope.dir}.`
				: "Applies to every file in the repo.";
	}
}
