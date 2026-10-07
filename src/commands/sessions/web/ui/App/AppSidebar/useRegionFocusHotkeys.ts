import { useTheme } from "@mui/material/styles";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import type { SessionInfo, SidebarTab } from "../../types";
import { useCaptureHotkey } from "../useCaptureHotkey";
import { useShortcut } from "../useShortcut";
import { focusRegion } from "../focusRegion";
import { backlogRegion } from "./useRegionFocusHotkeys/backlogRegion";
import { sessionRegion } from "./useRegionFocusHotkeys/sessionRegion";
import { useFocusSidebarHotkey } from "./useRegionFocusHotkeys/useFocusSidebarHotkey";
import { useToggleDiffHotkey } from "./useRegionFocusHotkeys/useToggleDiffHotkey";
import { useTopBarActionHotkey } from "./useRegionFocusHotkeys/useTopBarActionHotkey";

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
		sessions,
		activeId,
		tab,
		onTabChange,
		showSessions,
		ringColor,
	});

	useCaptureHotkey(
		useShortcut("focusTerminal").matches,
		useCallback(() => {
			const backlog = backlogRegion(pathname);
			if (backlog) {
				focusRegion(backlog, ringColor);
				return;
			}
			if (!activeId) return;
			showSessions();
			focusRegion(sessionRegion("terminal", activeId), ringColor);
		}, [pathname, activeId, showSessions, ringColor]),
	);

	useToggleDiffHotkey({
		session: sessions.find((s) => s.id === activeId),
		showSessions,
		ringColor,
	});

	const topBarTarget = { activeId, showSessions, ringColor };
	useTopBarActionHotkey("focusAddAgent", topBarTarget);
	useTopBarActionHotkey("focusVsCode", topBarTarget);
	useTopBarActionHotkey("focusDone", topBarTarget);
}
