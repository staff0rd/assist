import { useTheme } from "@mui/material/styles";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import { shortcutRegistry } from "../shortcutRegistry";
import type { SessionInfo, SidebarTab } from "../../types";
import { useCaptureHotkey } from "../useCaptureHotkey";
import { focusRegion } from "./useRegionFocusHotkeys/focusRegion";
import { sessionRegion } from "./useRegionFocusHotkeys/sessionRegion";
import { useFocusSidebarHotkey } from "./useRegionFocusHotkeys/useFocusSidebarHotkey";
import { useToggleDiffHotkey } from "./useRegionFocusHotkeys/useToggleDiffHotkey";

export function useRegionFocusHotkeys({
	sessions,
	activeId,
	tab,
	onTabChange,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	tab: SidebarTab;
	onTabChange: (tab: SidebarTab) => void;
}): void {
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const ringColor = useTheme().palette.primary.main;

	const showSessions = useCallback(() => {
		if (pathname !== "/sessions") navigate("/sessions");
	}, [pathname, navigate]);

	useFocusSidebarHotkey({
		activeId,
		tab,
		onTabChange,
		showSessions,
		ringColor,
	});

	useCaptureHotkey(
		shortcutRegistry.focusTerminal.matches,
		useCallback(() => {
			if (!activeId) return;
			showSessions();
			focusRegion(sessionRegion("terminal", activeId), ringColor);
		}, [activeId, showSessions, ringColor]),
	);

	useToggleDiffHotkey({
		session: sessions.find((s) => s.id === activeId),
		showSessions,
		ringColor,
	});
}
