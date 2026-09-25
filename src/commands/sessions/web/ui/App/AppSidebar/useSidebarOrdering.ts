import { useCallback, useMemo } from "react";
import { sortSessionsByStar } from "./useSidebarOrdering/sortSessionsByStar";
import {
	hasWaitedPastThreshold,
	sortSessionsByWaiting,
} from "./useSidebarOrdering/sortSessionsByWaiting";
import type { SessionInfo } from "../../types";
import { useSessionViewConfig } from "./useSidebarOrdering/useSessionViewConfig";
import { useStarredSessions } from "../useStarredSessions";
import { useWaitingClock } from "./useSidebarOrdering/useWaitingClock";

export function useSidebarOrdering(sessions: SessionInfo[]): {
	sessions: SessionInfo[];
	isFloatingWaiter: (session: SessionInfo) => boolean;
} {
	const { isStarred } = useStarredSessions();
	const { floatWaiting, floatWaitingAfterMs } = useSessionViewConfig();
	const now = useWaitingClock(floatWaiting);

	return {
		sessions: useMemo(
			() =>
				floatWaiting
					? sortSessionsByWaiting(sessions, isStarred, now, floatWaitingAfterMs)
					: sortSessionsByStar(sessions, isStarred),
			[sessions, isStarred, floatWaiting, floatWaitingAfterMs, now],
		),
		isFloatingWaiter: useCallback(
			(session: SessionInfo) =>
				floatWaiting &&
				hasWaitedPastThreshold(session, now, floatWaitingAfterMs),
			[floatWaiting, floatWaitingAfterMs, now],
		),
	};
}
