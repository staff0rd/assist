import { randomUUID } from "node:crypto";
import { getGlobalConfigPath } from "../../../../shared/loadConfigFrom";
import { planRuleChange } from "../../../rules/planRuleChange";
import type { PendingRuleChange, RuleChange } from "../../../rules/types";
import { pendingRuleChanges } from "./pendingRuleChanges";
import { sameRuleTarget } from "./sameRuleTarget";

export async function proposeRuleChange(
	change: RuleChange,
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): Promise<
	{ ok: true; pending: PendingRuleChange } | { ok: false; error: string }
> {
	const clash = [...pendingRuleChanges.values()].some(
		(stored) => stored.cwd === cwd && sameRuleTarget(stored.change, change),
	);
	if (clash)
		return {
			ok: false,
			error: "That rule already has a change awaiting approval",
		};
	const plan = await planRuleChange(change, { cwd, globalConfigPath });
	if (!plan.ok) return plan;
	const pending: PendingRuleChange = {
		id: randomUUID(),
		change,
		code: plan.code,
	};
	pendingRuleChanges.set(pending.id, { ...pending, cwd });
	return { ok: true, pending };
}
