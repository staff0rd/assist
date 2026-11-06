import { autoApprovePreview } from "./autoApprovePreview";
import { type SessionClient, sendTo } from "./broadcast";
import { buildPrPreview } from "./buildPrPreview";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { isPreviewKind } from "./isPreviewKind";
import { previewTargetLabel } from "./previewTargetLabel";
import { placeShowPreview } from "./placeShowPreview";
import { holdBlockingPreview } from "./holdBlockingPreview";

type Msg = Record<string, unknown>;

export function setPrPreview(
	sessions: Map<string, Session>,
	waiters: Map<string, SessionClient>,
	notify: () => void,
	client: SessionClient,
	d: Msg,
): void {
	const id = d.sessionId as string;
	const session = sessions.get(id);
	if (!session) {
		daemonLog(`pr-preview for unknown session id=${id} (ignoring)`);
		sendTo(client, {
			type: "error",
			message: `No live session ${id} for pr-preview`,
		});
		return;
	}
	const prNumber = typeof d.prNumber === "number" ? d.prNumber : null;
	const kind = isPreviewKind(d.kind) ? d.kind : "pr";
	const preview = buildPrPreview(d, kind, prNumber);
	if (kind === "show") {
		sendTo(client, { type: "show-ack", requestId: d.requestId });
		if (placeShowPreview(session, preview)) return notify();
	} else holdBlockingPreview(session, waiters, client, preview);
	const target = previewTargetLabel(
		kind,
		d.itemType === "bug" ? "bug" : "story",
		prNumber,
		d.draft === true,
	);
	daemonLog(
		`pr-preview set: id=${id} requestId=${d.requestId} kind=${kind} target=${target} reviewAfter=${preview.reviewAfter} screenshots=${preview.screenshots?.length ?? 0}`,
	);
	if (autoApprovePreview(sessions, waiters, notify, session)) return;
	notify();
}
