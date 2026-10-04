import { useCallback } from "react";
import { shortcutRegistry } from "../../shortcutRegistry";
import type { SessionInfo } from "../../../types";
import { useCaptureHotkey } from "../../useCaptureHotkey";
import { useDiffPanels } from "../../useDiffPanels";
import { focusRegion } from "./focusRegion";
import { isDiffFocused } from "./useToggleDiffHotkey/isDiffFocused";
import { sessionRegion } from "./sessionRegion";

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
		shortcutRegistry.toggleDiff.matches,
		useCallback(() => {
			if (!session?.cwd) return;
			const { id } = session;
			if (isDiffFocused(id)) {
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
