import { type SessionClient, sendTo } from "./broadcast";
import { buildPrPreview } from "./buildPrPreview";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { isPreviewKind } from "./isPreviewKind";
import { previewTargetLabel } from "./previewTargetLabel";
import { refuseShowOverApproval } from "./refuseShowOverApproval";

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
	if (kind === "show" && refuseShowOverApproval(session, client, d)) return;
	session.pendingPrPreview = buildPrPreview(d, kind, prNumber);
	if (kind === "show")
		sendTo(client, { type: "show-ack", requestId: d.requestId });
	else waiters.set(id, client);
	const target = previewTargetLabel(
		kind,
		d.itemType === "bug" ? "bug" : "story",
		prNumber,
		d.draft === true,
	);
	daemonLog(
		`pr-preview set: id=${id} requestId=${d.requestId} kind=${kind} target=${target}`,
	);
	notify();
}
