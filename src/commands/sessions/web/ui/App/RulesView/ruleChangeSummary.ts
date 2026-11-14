import type { PendingRuleChange, RuleScope } from "../../../../../rules/types";
import { codeNote } from "./codeNote";
import type { SummaryRow } from "./SummaryRow";
import { ruleChangeLabel } from "./ruleChangeLabel";
import { summaryRows } from "./summaryRows";

type RuleChangeSummary = {
	heading: string;
	rows: SummaryRow[];
	codeNote?: string;
};

export function ruleChangeSummary(
	pending: PendingRuleChange,
	scopes: RuleScope[],
): RuleChangeSummary {
	const { change } = pending;
	const nameOf = (id: string) => scopes.find((s) => s.id === id)?.name ?? id;
	const { rule } = change;
	const target =
		change.kind === "edit" ? scopes.find((s) => s.id === change.to) : undefined;
	return {
		heading: `${ruleChangeLabel(change)} ${rule.code ?? `“${rule.title ?? rule.text}”`}`,
		rows: summaryRows(change, nameOf),
		codeNote: codeNote(pending, target?.kind),
	};
}
