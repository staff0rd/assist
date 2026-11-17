import type { RuleScope } from "../../../../../rules/types";

export function addRuleFlag(scope: RuleScope): string {
	switch (scope.kind) {
		case "user-db":
			return "--user";
		case "user-node":
			return "--node";
		case "repo-db":
			return scope.label ? `--repo ${scope.label}` : "--repo";
		case "claude-md":
			return `--scope ${scope.dir ?? ""}CLAUDE.md`;
	}
}
