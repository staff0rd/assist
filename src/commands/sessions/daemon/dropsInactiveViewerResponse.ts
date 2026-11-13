import type { ViewerClaim } from "./claimViewer";
import { daemonLog } from "./daemonLog";
import type { Session } from "./types";

export function dropsInactiveViewerResponse(
	s: Session,
	response: boolean,
	viewer: ViewerClaim,
): boolean {
	if (!response || !s.activeViewer || viewer.viewerId === s.activeViewer)
		return false;
	daemonLog(
		`session ${s.id} dropped terminal response from inactive viewer ${viewer.viewerId ?? "unknown"} on ${viewer.viewerNode ?? "unknown node"}`,
	);
	return true;
}
