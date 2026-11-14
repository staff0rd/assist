import { changedSince } from "./changedSince";
import { readAdviceRules } from "./readAdviceRules";
import type { ruleScopeLocation } from "./ruleScopeLocation";
import type { RulePlanContext, RuleWritePlan } from "./RulePlanContext";
import { sameRuleText } from "./sameRuleText";
import type { RuleEntry } from "./types";
import { writeAdviceRules } from "./writeAdviceRules";
import { planClaudeMd } from "./planClaudeMd";

type Location = NonNullable<ReturnType<typeof ruleScopeLocation>>;
type Replacement = { title?: string; text: string } | undefined;

function isRuleText(value: unknown): value is { title?: string; text: string } {
	return typeof (value as { text?: unknown } | null)?.text === "string";
}

export async function planSourceUpdate(
	location: Location,
	rule: RuleEntry,
	replacement: Replacement,
	ctx: RulePlanContext,
): Promise<RuleWritePlan> {
	if (location.kind === "claude-md")
		return planClaudeMd(location.file, location.name, rule, replacement);
	const { cwd, globalConfigPath } = ctx;
	const rules = await readAdviceRules(location.scope, cwd, globalConfigPath);
	const index = rules.findIndex(
		(entry) => isRuleText(entry) && sameRuleText(entry, rule),
	);
	if (index === -1) return changedSince(rule, location.name);
	const next = replacement
		? rules.map((entry, i) =>
				i === index ? { ...(entry as object), ...replacement } : entry,
			)
		: rules.filter((_, i) => i !== index);
	return {
		ok: true,
		write: () => writeAdviceRules(location.scope, next, cwd, globalConfigPath),
	};
}
