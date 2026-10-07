import type { SessionStatus } from "../../../../../types";

const ENDED: ReadonlySet<SessionStatus> = new Set(["done", "stopped", "error"]);

export function hasEnded(status: SessionStatus): boolean {
	return ENDED.has(status);
}
