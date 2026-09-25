import { useMemo } from "react";
import { acceptanceCriteriaState } from "../../../../../../../../../../../../acceptanceCriteriaState";

export function useAcceptanceCriteria(body: string, editable: boolean) {
	return useMemo(
		() => (editable ? acceptanceCriteriaState(body) : null),
		[body, editable],
	);
}
