import type { PrPreview } from "../shared/SessionInfoBase";
import type { SessionClient } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { highLevelReviewHead } from "./highLevelReviewHead";
import { supersedePendingPreview } from "./supersedePendingPreview";

export function holdBlockingPreview(
	session: Session,
	waiters: Map<string, SessionClient>,
	client: SessionClient,
	preview: PrPreview,
	{ taskId, previewKey }: Record<string, unknown>,
): void {
	const supersedes = supersedePendingPreview(
		session,
		waiters,
		preview.requestId,
	);
	session.pendingPrPreview = supersedes ? { ...preview, supersedes } : preview;
	const head = highLevelReviewHead(preview);
	if (head) {
		session.highLevelReviewHead = head;
		daemonLog(`pr-preview high-level head: id=${session.id} head=${head}`);
	}
	session.pendingPreviewKey =
		typeof previewKey === "string" ? previewKey : undefined;
	session.pendingPreviewTaskId =
		typeof taskId === "string" ? taskId : undefined;
	if (session.pendingShow) {
		daemonLog(
			`pr-preview show closed: id=${session.id} requestId=${session.pendingShow.requestId} by=${preview.requestId}`,
		);
		session.pendingShow = undefined;
	}
	waiters.set(session.id, client);
}
