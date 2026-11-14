import { findRepoRoot } from "../../shared/findRepoRoot";
import type { RulePlanContext, RuleWrite } from "./RulePlanContext";
import { ruleScopeLocation } from "./ruleScopeLocation";
import type { RuleChange } from "./types";
import { updateScopedRulesIndex } from "./updateScopedRulesIndex";
import { planWrites } from "./planWrites";

type RulePlan =
	| { ok: true; code?: string; writes: RuleWrite[] }
	| { ok: false; error: string };

export async function planRuleChange(
	change: RuleChange,
	ctx: Omit<RulePlanContext, "root">,
): Promise<RulePlan> {
	const root = findRepoRoot(ctx.cwd) ?? ctx.cwd;
	const source = ruleScopeLocation(change.scopeId, root);
	if (!source) return { ok: false, error: `Unknown scope ${change.scopeId}` };
	const plans = await planWrites(change, source, { ...ctx, root });
	if (typeof plans === "string") return { ok: false, error: plans };
	const failed = plans.find((plan) => !plan.ok);
	if (failed && !failed.ok) return failed;
	const writes = plans.flatMap((plan) => (plan.ok ? [plan.write] : []));
	const code = plans.flatMap((plan) =>
		plan.ok && plan.code ? [plan.code] : [],
	)[0];
	const touchesClaudeMd = [
		change.scopeId,
		change.kind === "edit" ? change.to : "",
	].some((id) => id.startsWith("claude-md:"));
	if (touchesClaudeMd)
		writes.push(async () => {
			updateScopedRulesIndex(root);
			return undefined;
		});
	return { ok: true, code, writes };
}
