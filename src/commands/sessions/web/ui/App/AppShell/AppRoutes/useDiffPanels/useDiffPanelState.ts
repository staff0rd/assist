import { useCallback, useEffect, useMemo, useState } from "react";
import {
	closeDiffPanel,
	type DiffPanel,
	type DiffPanelMap,
	type DiffPanelTarget,
	pruneDiffPanels,
	setDiffPanelScope,
	toggleDiffPanel,
	toggleDiffPanelMode,
} from "../toggleDiffPanel";

export type DiffPanels = {
	panelFor: (sessionId: string | null) => DiffPanel | undefined;
	togglePanel: (sessionId: string, target: DiffPanelTarget) => void;
	closePanel: (sessionId: string) => void;
	setPanelScope: (sessionId: string, scope: string) => void;
	togglePanelMode: (sessionId: string) => void;
};

export function useDiffPanelState(
	sessionIds: string[],
	onActivateSession: (sessionId: string) => void,
): DiffPanels {
	const [panels, setPanels] = useState<DiffPanelMap>({});
	const liveKey = sessionIds.join(" ");

	useEffect(() => {
		const live = liveKey === "" ? [] : liveKey.split(" ");
		setPanels((current) => pruneDiffPanels(current, live));
	}, [liveKey]);

	const togglePanel = useCallback(
		(sessionId: string, target: DiffPanelTarget) => {
			onActivateSession(sessionId);
			setPanels((current) => toggleDiffPanel(current, sessionId, target));
		},
		[onActivateSession],
	);

	return useMemo(
		() => ({
			panelFor: (sessionId: string | null) =>
				sessionId === null ? undefined : panels[sessionId],
			togglePanel,
			closePanel: (sessionId: string) =>
				setPanels((current) => closeDiffPanel(current, sessionId)),
			setPanelScope: (sessionId: string, scope: string) =>
				setPanels((current) => setDiffPanelScope(current, sessionId, scope)),
			togglePanelMode: (sessionId: string) =>
				setPanels((current) => toggleDiffPanelMode(current, sessionId)),
		}),
		[panels, togglePanel],
	);
}
