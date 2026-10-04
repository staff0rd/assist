import { daemonLog } from "./daemonLog";
import type { Session } from "./types";

export type ViewerClaim = {
	viewerId?: string;
	viewerNode?: string;
	claim?: boolean;
	onClaim?: () => void;
};

export function claimViewer(
	session: Session,
	{ viewerId, viewerNode, onClaim }: ViewerClaim,
	via: string,
): void {
	if (!viewerId || session.activeViewer === viewerId) return;
	session.activeViewer = viewerId;
	session.activeViewerNode = viewerNode;
	daemonLog(
		`session ${session.id} active viewer ${viewerId} on ${viewerNode ?? "unknown node"} (${via})`,
	);
	onClaim?.();
}
