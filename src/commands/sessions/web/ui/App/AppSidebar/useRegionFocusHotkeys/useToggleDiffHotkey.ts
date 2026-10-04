import { useCallback } from "react";
import type { SessionInfo } from "../../../types";
import { useCaptureHotkey } from "../../useCaptureHotkey";
import { useShortcut } from "../../useShortcut";
import { useDiffPanels } from "../../useDiffPanels";
import { focusRegion } from "../../focusRegion";
import { isRegionFocused } from "./useToggleDiffHotkey/isRegionFocused";
import { sessionRegion } from "./sessionRegion";
import { togglePreviewFocus } from "./useToggleDiffHotkey/togglePreviewFocus";

export function useToggleDiffHotkey({
	session,
	showSessions,
	ringColor,
}: {
	session: SessionInfo | undefined;
	showSessions: () => void;
	ringColor: string;
}): void {
	const { panelFor, togglePanel, closePanel } = useDiffPanels();

	useCaptureHotkey(
		useShortcut("toggleDiff").matches,
		useCallback(() => {
			if (!session) return;
			const { id } = session;
			if (session.pendingPrPreview) {
				togglePreviewFocus(id, showSessions, ringColor);
				return;
			}
			if (!session.cwd) return;
			if (isRegionFocused("diff", id)) {
				closePanel(id);
				focusRegion(sessionRegion("terminal", id), ringColor);
				return;
			}
			showSessions();
			if (!panelFor(id))
				togglePanel(id, {
					cwd: session.cwd,
					claudeSessionId: session.claudeSessionId,
					scope: "all",
				});
			focusRegion(sessionRegion("diff", id), ringColor);
		}, [session, showSessions, panelFor, togglePanel, closePanel, ringColor]),
	);
}
