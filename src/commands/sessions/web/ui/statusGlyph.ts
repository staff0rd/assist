import type { DisplayStatus } from "./displayStatus";

export const statusGlyph: Record<Exclude<DisplayStatus, "check">, string> = {
	running: "●",
	idle: "●",
	waiting: "◆",
	question: "?",
	done: "✓",
	error: "✕",
	stopped: "○",
};
