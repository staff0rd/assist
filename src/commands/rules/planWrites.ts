import { planRuleAddition } from "./planRuleAddition";
import { planSourceUpdate } from "./planSourceUpdate";
import type { RulePlanContext, RuleWritePlan } from "./RulePlanContext";
import { ruleScopeLocation } from "./ruleScopeLocation";
import type { RuleChange } from "./types";

type Location = NonNullable<ReturnType<typeof ruleScopeLocation>>;

export async function planWrites(
	change: RuleChange,
	source: Location,
	ctx: RulePlanContext,
): Promise<RuleWritePlan[] | string> {
	if (change.kind === "delete")
		return [await planSourceUpdate(source, change.rule, undefined, ctx)];
	const target =
		change.to === change.scopeId
			? source
			: ruleScopeLocation(change.to, ctx.root);
	if (!target) return `Unknown scope ${change.to}`;
	const error = editError(change, target);
	if (error) return error;
	const rule = {
		title: change.title?.trim() || undefined,
		text: change.text.trim(),
	};
	if (target === source)
		return [await planSourceUpdate(source, change.rule, rule, ctx)];
	return [
		await planRuleAddition(target, rule, ctx),
		await planSourceUpdate(source, change.rule, undefined, ctx),
	];
}

function editError(
	change: Extract<RuleChange, { kind: "edit" }>,
	target: Location,
): string | undefined {
	if (change.text.trim() === "") return "Rule text is required";
	if (target.kind === "advice" && !change.title?.trim())
		return `Rules in ${target.name} need a title`;
	return undefined;
}
