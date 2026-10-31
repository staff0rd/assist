import type { PrPreview } from "../shared/SessionInfoBase";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { supersedePendingPreview } from "./supersedePendingPreview";

export function holdBlockingPreview(
	session: Session,
	waiters: Map<string, SessionClient>,
	client: SessionClient,
	preview: PrPreview,
): void {
	const supersedes = supersedePendingPreview(
		session,
		waiters,
		preview.requestId,
	);
	session.pendingPrPreview = supersedes ? { ...preview, supersedes } : preview;
	if (session.pendingShow) {
		daemonLog(
			`pr-preview show closed: id=${session.id} requestId=${session.pendingShow.requestId} by=${preview.requestId}`,
		);
		session.pendingShow = undefined;
	}
	waiters.set(session.id, client);
}
