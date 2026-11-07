import { findCodexRolloutPathSync } from "./findCodexRolloutPathSync";

export function hasCodexRolloutSync(sessionId: string): boolean {
	return findCodexRolloutPathSync(sessionId) !== null;
}
