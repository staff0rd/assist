import type { DisplayStatus } from "./displayStatus";

export const statusGlyph: Record<
	Exclude<DisplayStatus, "check" | "design">,
	string
> = {
	running: "●",
	idle: "●",
	waiting: "◆",
	question: "?",
	done: "✓",
	error: "✕",
	stopped: "○",
};
