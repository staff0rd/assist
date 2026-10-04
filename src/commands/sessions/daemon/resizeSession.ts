import { claimViewer, type ViewerClaim } from "./claimViewer";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { nudgePty } from "./nudgePty";

export function resizeSession(
	sessions: Map<string, Session>,
	id: string,
	cols: number,
	rows: number,
	viewer: ViewerClaim = {},
): void {
	const s = sessions.get(id);
	if (!s || s.status === "done" || !s.pty) return;
	if (isInactiveViewer(s, viewer)) return;
	claimViewer(s, viewer, "resize");
	const unchanged = s.cols === cols && s.rows === rows;
	if (!unchanged || viewer.claim)
		daemonLog(
			`session ${id} resize ${s.cols}x${s.rows} -> ${cols}x${rows} by ${viewer.viewerId ?? "unknown viewer"} on ${viewer.viewerNode ?? "unknown node"}${viewer.claim ? " (takeover)" : ""}`,
		);
	s.cols = cols;
	s.rows = rows;
	const resize = (c: number, r: number) => resizePty(s, c, r);
	resize(cols, rows);
	if (viewer.claim && unchanged) nudgePty(s, resize);
}

function isInactiveViewer(
	s: Session,
	{ viewerId, claim }: ViewerClaim,
): boolean {
	if (claim || !viewerId || !s.activeViewer) return false;
	return s.activeViewer !== viewerId;
}

function resizePty(s: Session, cols: number, rows: number): void {
	try {
		s.pty?.resize(cols, rows);
	} catch (error) {
		daemonLog(
			`session ${s.id} resize skipped (dead pty): ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
