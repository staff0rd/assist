import { skipsTerminalPath } from "./skipsTerminalPath";
import { claimViewer, type ViewerClaim } from "./claimViewer";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { nudgePty } from "./nudgePty";
import { resizePty } from "./resizePty";
import { sendResizeSnapshot } from "./sendResizeSnapshot";
import { rememberViewerSize } from "./viewerSize";

export type ResizeViewer = ViewerClaim & {
	refresh?: boolean;
	sendSnapshot?: (data: string) => void;
};

export function resizeSession(
	sessions: Map<string, Session>,
	id: string,
	cols: number,
	rows: number,
	viewer: ResizeViewer = {},
): void {
	const s = sessions.get(id);
	if (!s || isInactiveViewer(s, viewer) || skipsTerminalPath(s, "resize"))
		return;
	claimViewer(s, viewer, "resize");
	if (s.status === "done" || !s.pty) return;
	const unchanged = s.cols === cols && s.rows === rows;
	if (!unchanged || viewer.claim)
		daemonLog(
			`session ${id} resize ${s.cols}x${s.rows} -> ${cols}x${rows} by ${viewer.viewerId ?? "unknown viewer"} on ${viewer.viewerNode ?? "unknown node"}${viewer.claim ? " (takeover)" : ""}`,
		);
	s.cols = cols;
	s.rows = rows;
	rememberViewerSize(cols, rows);
	const resize = (c: number, r: number) => resizePty(s, c, r);
	resize(cols, rows);
	if (viewer.sendSnapshot && (viewer.claim || viewer.refresh))
		sendResizeSnapshot(s, viewer.sendSnapshot);
	else if (viewer.claim && unchanged) nudgePty(s, resize);
}

function isInactiveViewer(
	s: Session,
	{ viewerId, claim }: ViewerClaim,
): boolean {
	if (claim || !viewerId || !s.activeViewer) return false;
	return s.activeViewer !== viewerId;
}
