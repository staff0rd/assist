import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function markResumedOverPreview(session: Session): void {
	const preview = session.pendingPrPreview;
	if (!preview || preview.kind === "show") return;
	if (session.resumedOverPreview === preview.requestId) return;
	session.resumedOverPreview = preview.requestId;
	daemonLog(
		`pr-preview resumed over: id=${session.id} requestId=${preview.requestId} kind=${preview.kind ?? "pr"}`,
	);
}
