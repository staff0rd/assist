import { contextLevel } from "../../../../shared/contextLevel";
import type { HarnessKind } from "../../../../shared/harnesses";
import type { SessionStatus } from "./types";

export const statusColors: Record<SessionStatus, string> = {
	running: "success.main",
	waiting: "warning.main",
	done: "info.main",
	error: "error.main",
	stopped: "text.secondary",
};

export function contextColor(pct: number, harness?: HarnessKind): string {
	switch (contextLevel(pct, harness)) {
		case "red":
			return "error.main";
		case "yellow":
			return "warning.main";
		default:
			return "text.disabled";
	}
}
