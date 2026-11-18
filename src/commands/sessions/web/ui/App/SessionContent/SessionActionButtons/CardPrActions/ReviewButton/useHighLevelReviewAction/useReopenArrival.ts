import { useEffect } from "react";
import type { SessionInfo } from "../../../../../../types";
import { clearReopeningHighLevelReview } from "../../../../../useReopeningHighLevelReview";
import { hasPendingHighLevelReview } from "./hasPendingHighLevelReview";

export function useReopenArrival(
	session: SessionInfo | undefined,
	prNumber: number,
): boolean {
	const arrived = session
		? hasPendingHighLevelReview(session, prNumber)
		: false;
	const sessionId = session?.id;
	useEffect(() => {
		if (arrived && sessionId) clearReopeningHighLevelReview(sessionId);
	}, [arrived, sessionId]);
	return arrived;
}
