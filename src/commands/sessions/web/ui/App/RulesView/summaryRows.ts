import type { RuleChange } from "../../../../../rules/types";
import type { SummaryRow } from "./SummaryRow";

function row(label: string, before: string, after: string): SummaryRow {
	return before === after ? { label, after } : { label, before, after };
}

export function summaryRows(
	change: RuleChange,
	nameOf: (scopeId: string) => string,
): SummaryRow[] {
	const { rule } = change;
	if (change.kind === "delete")
		return [
			{ label: "Scope", after: nameOf(change.scopeId) },
			...(rule.title ? [{ label: "Title", after: rule.title }] : []),
			{ label: "Rule", after: rule.text },
		];
	return [
		row("Scope", nameOf(change.scopeId), nameOf(change.to)),
		row("Title", rule.title ?? "", change.title ?? ""),
		row("Rule", rule.text, change.text.trim()),
	].filter((r) => r.before !== undefined || r.after !== "");
}
