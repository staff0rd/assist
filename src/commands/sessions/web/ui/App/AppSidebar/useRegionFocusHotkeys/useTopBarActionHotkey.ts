import { useCallback } from "react";
import { type ShortcutName, shortcutRegistry } from "../../shortcutRegistry";
import { useCaptureHotkey } from "../../useCaptureHotkey";
import { focusRegion } from "../../focusRegion";
import { topBarActionRegion } from "./useTopBarActionHotkey/topBarActionRegion";

export function useTopBarActionHotkey(
	shortcut: ShortcutName,
	{
		activeId,
		showSessions,
		ringColor,
	}: {
		activeId: string | null;
		showSessions: () => void;
		ringColor: string;
	},
): void {
	useCaptureHotkey(
		shortcutRegistry[shortcut].matches,
		useCallback(() => {
			if (!activeId) return;
			showSessions();
			focusRegion(topBarActionRegion(shortcut, activeId), ringColor);
		}, [shortcut, activeId, showSessions, ringColor]),
	);
}
