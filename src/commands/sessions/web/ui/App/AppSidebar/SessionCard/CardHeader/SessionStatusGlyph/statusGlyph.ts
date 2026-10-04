import type { DisplayStatus } from "../../../../displayStatus";

export const statusGlyph: Record<DisplayStatus, string> = {
	running: "●",
	idle: "●",
	waiting: "◆",
	done: "✓",
	error: "✕",
	stopped: "○",
};
