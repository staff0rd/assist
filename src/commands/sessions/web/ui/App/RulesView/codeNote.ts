import type { PendingRuleChange, RuleScope } from "../../../../../rules/types";

export function codeNote(
	{ change, code }: PendingRuleChange,
	targetKind: RuleScope["kind"] | undefined,
): string | undefined {
	const current = change.rule.code;
	if (change.kind === "delete")
		return current ? `Removes ${current}` : "Removes the advice.rules entry";
	if (change.to === change.scopeId)
		return current ? `Keeps ${current}` : undefined;
	if (targetKind === "claude-md")
		return `Gets ${code}, the next repo-wide code`;
	return current
		? `Drops ${current}; advice.rules entries have no code`
		: undefined;
}
