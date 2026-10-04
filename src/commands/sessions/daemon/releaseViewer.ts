import { daemonLog } from "./daemonLog";
import type { Session } from "./types";

export function releaseViewer(
	sessions: Map<string, Session>,
	viewerId: string,
): boolean {
	let released = false;
	for (const s of sessions.values()) {
		if (s.activeViewer !== viewerId) continue;
		daemonLog(
			`session ${s.id} active viewer ${viewerId} on ${s.activeViewerNode ?? "unknown node"} left`,
		);
		s.activeViewer = undefined;
		s.activeViewerNode = undefined;
		released = true;
	}
	return released;
}
