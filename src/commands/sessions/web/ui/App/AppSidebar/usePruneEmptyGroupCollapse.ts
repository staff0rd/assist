import { useEffect } from "react";
import { groupCollapseStore } from "./useCollapsedGroups/groupCollapseStore";
import { repoGroupKey } from "../../repoGroupKey";
import type { SessionInfo } from "../../types";

export function usePruneEmptyGroupCollapse(
	sessions: SessionInfo[],
	sessionsLoaded: boolean,
): void {
	useEffect(() => {
		if (!sessionsLoaded) return;
		const live = new Set(sessions.map(repoGroupKey));
		const saved = Object.keys(
			groupCollapseStore.parse(groupCollapseStore.getRaw()),
		);
		const empty = saved.filter((key) => !live.has(key));
		if (empty.length) groupCollapseStore.removeChoices(empty);
	}, [sessions, sessionsLoaded]);
}
