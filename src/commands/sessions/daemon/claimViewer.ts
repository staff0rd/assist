import { daemonLog } from "./daemonLog";
import type { Session } from "./types";

export type ViewerClaim = {
	viewerId?: string;
	claim?: boolean;
	onClaim?: () => void;
};

export function claimViewer(
	session: Session,
	{ viewerId, onClaim }: ViewerClaim,
	via: string,
): void {
	if (!viewerId || session.activeViewer === viewerId) return;
	session.activeViewer = viewerId;
	daemonLog(`session ${session.id} active viewer ${viewerId} (${via})`);
	onClaim?.();
}
