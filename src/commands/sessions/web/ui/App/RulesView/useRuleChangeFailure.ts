import { useCallback, useState } from "react";
import type { RuleChangeDecision } from "./useRuleChanges";

export function useRuleChangeFailure(
	decide: (
		id: string,
		decision: RuleChangeDecision,
	) => Promise<string | undefined>,
) {
	const [failure, setFailure] = useState<string>();
	const onDecide = useCallback(
		async (id: string, decision: RuleChangeDecision) =>
			setFailure(await decide(id, decision)),
		[decide],
	);
	return { failure, clearFailure: () => setFailure(undefined), onDecide };
}
