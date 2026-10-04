import { useCallback } from "react";
import type { SidebarTab } from "../../../types";
import { useCaptureHotkey } from "../../useCaptureHotkey";
import { useShortcut } from "../../useShortcut";
import { useSidebarCollapsedContext } from "../../useSidebarCollapsedContext";
import { focusRegion } from "../../focusRegion";
import { sessionRegion } from "./sessionRegion";

export function useFocusSidebarHotkey({
	activeId,
	tab,
	onTabChange,
	showSessions,
	ringColor,
}: {
	activeId: string | null;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
	showSessions: () => void;
	ringColor: string;
}): void {
	const { collapsed, onToggleCollapsed } = useSidebarCollapsedContext();

	useCaptureHotkey(
		useShortcut("focusSidebar").matches,
		useCallback(() => {
			if (!activeId) return;
			showSessions();
			if (collapsed) onToggleCollapsed();
			if (tab !== "active") onTabChange("active");
			focusRegion(sessionRegion("card", activeId), ringColor);
		}, [
			activeId,
			showSessions,
			collapsed,
			onToggleCollapsed,
			tab,
			onTabChange,
			ringColor,
		]),
	);
}
