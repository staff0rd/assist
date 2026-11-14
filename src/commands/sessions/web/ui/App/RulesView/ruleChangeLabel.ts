import type { RuleChange } from "../../../../../rules/types";

export function ruleChangeLabel(
	change: RuleChange,
): "Edit" | "Move" | "Delete" {
	if (change.kind === "delete") return "Delete";
	return change.to === change.scopeId ? "Edit" : "Move";
}
