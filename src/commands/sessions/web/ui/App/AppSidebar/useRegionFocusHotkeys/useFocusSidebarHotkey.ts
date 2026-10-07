import { useCallback } from "react";
import { useLocation } from "react-router";
import type { SessionInfo, SidebarTab } from "../../../types";
import { useCaptureHotkey } from "../../useCaptureHotkey";
import { useShortcut } from "../../useShortcut";
import { useSidebarCollapsedContext } from "../../useSidebarCollapsedContext";
import { focusRegion, type Region } from "../../focusRegion";
import { sessionRegion } from "./sessionRegion";
import { sidebarCardRegion } from "./useFocusSidebarHotkey/sidebarCardRegion";
import { useLastActiveId } from "./useFocusSidebarHotkey/useLastActiveId";

export function useFocusSidebarHotkey({
	sessions,
	activeId,
	tab,
	onTabChange,
	showSessions,
	ringColor,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	showSessions: () => void;
	ringColor: string;
}): void {
	const { collapsed, onToggleCollapsed } = useSidebarCollapsedContext();
	const onBacklog = useLocation().pathname.startsWith("/backlog");
	const lastActiveId = useLastActiveId(activeId);

	const resolveCard = useCallback((): Region | null => {
		if (onBacklog) {
			const id = lastActiveId.current;
			return sidebarCardRegion(sessions.some((s) => s.id === id) ? id : null);
		}
		if (!activeId) return null;
		showSessions();
		return sessionRegion("card", activeId);
	}, [onBacklog, lastActiveId, sessions, activeId, showSessions]);

	useCaptureHotkey(
		useShortcut("focusSidebar").matches,
		useCallback(() => {
			const card = resolveCard();
			if (!card) return;
			if (collapsed) onToggleCollapsed();
			if (tab !== "active") onTabChange("active");
			focusRegion(card, ringColor);
		}, [
			resolveCard,
			collapsed,
			onToggleCollapsed,
			tab,
			onTabChange,
			ringColor,
		]),
	);
}
