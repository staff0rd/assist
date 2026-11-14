import type { PendingRuleChange } from "../../../rules/types";

type StoredRuleChange = PendingRuleChange & { cwd: string };

export const pendingRuleChanges = new Map<string, StoredRuleChange>();
