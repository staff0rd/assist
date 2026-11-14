import type { PendingRuleChange } from "../../../rules/types";
import { pendingRuleChanges } from "./pendingRuleChanges";

export function listRuleChanges(cwd: string): PendingRuleChange[] {
	return [...pendingRuleChanges.values()]
		.filter((stored) => stored.cwd === cwd)
		.map(({ cwd: _cwd, ...pending }) => pending);
}
