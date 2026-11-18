import {
	clearReopeningHighLevelReview,
	markReopeningHighLevelReview,
} from "../../../../../useReopeningHighLevelReview";
import { requestReopenHighLevelReview } from "./requestReopenHighLevelReview";

export function startHighLevelReopen(
	sessionId: string,
	prNumber: number,
	node: string | undefined,
	onError: (message: string) => void,
): void {
	if (!markReopeningHighLevelReview(sessionId, prNumber)) return;
	void requestReopenHighLevelReview(sessionId, prNumber, node).then(
		(failure) => {
			clearReopeningHighLevelReview(sessionId);
			if (failure) onError(failure);
		},
	);
}
