export type DiffPanelMode = "half" | "full";

export type DiffPanelTarget = {
	cwd: string;
	claudeSessionId?: string;
	scope: string;
};

export type DiffPanel = DiffPanelTarget & { mode: DiffPanelMode };

export type DiffPanelMap = Record<string, DiffPanel>;

export function toggleDiffPanel(
	panels: DiffPanelMap,
	sessionId: string,
	target: DiffPanelTarget,
): DiffPanelMap {
	const open = panels[sessionId];
	if (open && open.cwd === target.cwd && open.scope === target.scope)
		return closeDiffPanel(panels, sessionId);
	return { ...panels, [sessionId]: { ...target, mode: open?.mode ?? "half" } };
}

export function closeDiffPanel(
	panels: DiffPanelMap,
	sessionId: string,
): DiffPanelMap {
	const { [sessionId]: closed, ...rest } = panels;
	return closed ? rest : panels;
}

export function pruneDiffPanels(
	panels: DiffPanelMap,
	liveSessionIds: string[],
): DiffPanelMap {
	const live = new Set(liveSessionIds);
	const kept = Object.entries(panels).filter(([sessionId]) =>
		live.has(sessionId),
	);
	if (kept.length === Object.keys(panels).length) return panels;
	return Object.fromEntries(kept);
}

export function setDiffPanelScope(
	panels: DiffPanelMap,
	sessionId: string,
	scope: string,
): DiffPanelMap {
	const open = panels[sessionId];
	if (!open) return panels;
	return { ...panels, [sessionId]: { ...open, scope } };
}

export function toggleDiffPanelMode(
	panels: DiffPanelMap,
	sessionId: string,
): DiffPanelMap {
	const open = panels[sessionId];
	if (!open) return panels;
	const mode = open.mode === "half" ? "full" : "half";
	return { ...panels, [sessionId]: { ...open, mode } };
}
