import type { RuleEntry, RuleScope } from "../../../../../rules/types";
import { formatQuotedComment } from "../formatQuotedComment";

export type RuleComment = {
	rule: RuleEntry;
	scope: RuleScope;
	quote: string;
	note: string;
};

function ruleHeading({ rule, scope }: RuleComment): string {
	if (scope.kind === "claude-md")
		return `Rule ${rule.code ?? rule.title ?? ""} in \`${scope.name}\``;
	const where = scope.label ? `${scope.name}: ${scope.label}` : scope.name;
	return `Rule "${rule.title ?? rule.text}" in advice.rules, ${where}`;
}

export function formatRuleComment(comment: RuleComment): string {
	const { quote, note } = comment;
	return `${ruleHeading(comment)}\n\n${formatQuotedComment(quote, note)}`;
}
