import { getGlobalConfigPath } from "../../shared/loadConfigFrom";
import { planRuleChange } from "./planRuleChange";
import type { RuleChange } from "./types";

export async function applyRuleChange(
	change: RuleChange,
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): Promise<{ ok: true; code?: string } | { ok: false; error: string }> {
	const plan = await planRuleChange(change, { cwd, globalConfigPath });
	if (!plan.ok) return plan;
	for (const write of plan.writes) {
		const error = await write();
		if (error) return { ok: false, error };
	}
	return { ok: true, code: plan.code };
}
