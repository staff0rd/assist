import { useTheme } from "@mui/material/styles";
import type { SessionInfo } from "../../types";
import { useToggleDiffHotkey } from "../AppSidebar/useRegionFocusHotkeys/useToggleDiffHotkey";

export function useCardDiffHotkey(
	session: SessionInfo | undefined,
	showSession: () => void,
): void {
	useToggleDiffHotkey({
		session,
		showSessions: showSession,
		ringColor: useTheme().palette.primary.main,
	});
}
