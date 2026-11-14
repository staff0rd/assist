import { getGlobalConfigPath } from "../../../../shared/loadConfigFrom";
import { applyRuleChange } from "../../../rules/applyRuleChange";
import { pendingRuleChanges } from "./pendingRuleChanges";

export async function decideRuleChange(
	id: string,
	decision: "approve" | "reject",
	globalConfigPath: string = getGlobalConfigPath(),
): Promise<{ ok: true; code?: string } | { ok: false; error: string }> {
	const stored = pendingRuleChanges.get(id);
	if (!stored)
		return { ok: false, error: "No such rule change awaiting approval" };
	pendingRuleChanges.delete(id);
	if (decision === "reject") return { ok: true };
	return applyRuleChange(stored.change, stored.cwd, globalConfigPath);
}
