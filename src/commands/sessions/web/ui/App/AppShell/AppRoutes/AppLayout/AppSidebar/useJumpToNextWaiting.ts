import { useCallback } from "react";
import { nextWaitingSessionId } from "./useJumpToNextWaiting/nextWaitingSessionId";
import { scrollSessionCardIntoView } from "./useJumpToNextWaiting/scrollSessionCardIntoView";
import type { SessionInfo, SidebarTab } from "../../../../../types";
import { useNextWaitingHotkey } from "./useJumpToNextWaiting/useNextWaitingHotkey";
import { useStarredSessions } from "../../useStarredSessions";
import { visibleSessionOrder } from "./useJumpToNextWaiting/visibleSessionOrder";

export function useJumpToNextWaiting({
	sessions,
	activeId,
	tab,
	onSelect,
	onTabChange,
	isFloatingWaiter,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	tab: SidebarTab;
	onSelect: (id: string) => void;
	onTabChange: (tab: SidebarTab) => void;
	isFloatingWaiter?: (session: SessionInfo) => boolean;
}): void {
	const { isStarred } = useStarredSessions();
	useNextWaitingHotkey(
		useCallback(() => {
			const id = nextWaitingSessionId(
				visibleSessionOrder(sessions, isStarred, isFloatingWaiter),
				activeId,
			);
			if (!id) return;
			if (tab !== "active") onTabChange("active");
			onSelect(id);
			scrollSessionCardIntoView(id);
		}, [
			sessions,
			isStarred,
			isFloatingWaiter,
			activeId,
			tab,
			onSelect,
			onTabChange,
		]),
	);
}
