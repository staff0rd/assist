import type { DisplayStatus } from "./displayStatus";

export const statusGlyph: Record<DisplayStatus, string> = {
	running: "●",
	idle: "●",
	waiting: "◆",
	question: "?",
	done: "✓",
	error: "✕",
	stopped: "○",
};
