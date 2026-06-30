import type { SessionInfo } from "./types";

const lastRendered = new Map<string, string>();

export function logRenderedStatus(sessions: SessionInfo[]): void {
	const live = new Set<string>();
	for (const { id, status } of sessions) {
		live.add(id);
		if (lastRendered.get(id) !== status) {
			lastRendered.set(id, status);
			console.debug(`[sessions] render session ${id} status=${status}`);
		}
	}
	for (const id of lastRendered.keys()) {
		if (!live.has(id)) lastRendered.delete(id);
	}
}
