import { useMemo } from "react";
import type { SessionInfo } from "../../types";
import { groupBoardSessions } from "./groupBoardSessions";
import { useBoardRepoFilter } from "./useBoardRepoFilter";

export function useBoardGroups(sessions: SessionInfo[]) {
	const { shown, ...filter } = useBoardRepoFilter(sessions);
	const groups = useMemo(() => groupBoardSessions(shown), [shown]);
	return { filter, groups };
}
