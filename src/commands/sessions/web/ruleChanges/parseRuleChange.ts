import type { RuleChange, RuleEntry } from "../../../rules/types";

type Fields = Record<string, unknown>;

function optionalString(value: unknown): value is string | undefined {
	return value === undefined || typeof value === "string";
}

function parseRuleEntry(value: unknown): RuleEntry | undefined {
	const rule = value as Fields | null;
	if (typeof rule?.text !== "string") return undefined;
	if (!optionalString(rule.code) || !optionalString(rule.title))
		return undefined;
	return { code: rule.code, title: rule.title, text: rule.text };
}

export function parseRuleChange(value: unknown): RuleChange | undefined {
	const change = value as Fields | null;
	const rule = parseRuleEntry(change?.rule);
	if (!change || !rule || typeof change.scopeId !== "string") return undefined;
	const { scopeId } = change;
	if (change.kind === "delete") return { kind: "delete", scopeId, rule };
	if (change.kind !== "edit") return undefined;
	const { to, title, text } = change;
	if (typeof to !== "string" || typeof text !== "string") return undefined;
	if (!optionalString(title)) return undefined;
	return { kind: "edit", scopeId, rule, to, title, text };
}
