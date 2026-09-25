import type { SessionStatus } from "../../../../../../../../../../../../../../types";

export const statusGlyph: Record<SessionStatus, string> = {
	running: "●",
	waiting: "◆",
	done: "✓",
	error: "✕",
	stopped: "○",
};
