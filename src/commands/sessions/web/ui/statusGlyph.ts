import type { DisplayStatus } from "./displayStatus";

export const statusGlyph: Record<DisplayStatus, string> = {
	running: "●",
	idle: "●",
	waiting: "◆",
	question: "?",
	check: "◎",
	done: "✓",
	error: "✕",
	stopped: "○",
};
