import { useCallback, useState } from "react";
import type { PendingRuleChange, RuleChange } from "../../../../../rules/types";
import { useApiNode } from "../../useApiNode";
import { useLoadRuleChanges } from "./useLoadRuleChanges";
import { postRuleApi } from "./postRuleApi";

export type RuleChangeDecision = "approve" | "reject";

export function useRuleChanges(cwd: string, onApplied: () => void) {
	const [changes, setChanges] = useState<PendingRuleChange[]>([]);
	const node = useApiNode();

	useLoadRuleChanges(cwd, node, setChanges);

	const propose = useCallback(
		async (change: RuleChange): Promise<string | undefined> => {
			const result = await postRuleApi(
				"/api/rules/changes",
				node,
				{ cwd, change },
				"Failed to send the change for approval",
			);
			if (!result.ok) return result.error;
			const pending = result.body.change as PendingRuleChange;
			setChanges((current) => [...current, pending]);
			return undefined;
		},
		[cwd, node],
	);

	const decide = useCallback(
		async (id: string, decision: RuleChangeDecision) => {
			const result = await postRuleApi(
				"/api/rules/changes/decide",
				node,
				{ id, decision },
				"Failed to apply the change",
			);
			setChanges((current) => current.filter((change) => change.id !== id));
			if (decision === "approve") onApplied();
			return result.ok ? undefined : result.error;
		},
		[node, onApplied],
	);

	return { changes, propose, decide };
}
