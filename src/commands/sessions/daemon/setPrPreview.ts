import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { isPreviewKind } from "./isPreviewKind";
import { parsePreviewMetadata } from "./parsePreviewMetadata";
import { previewTargetLabel } from "./previewTargetLabel";

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
	const itemType = d.itemType === "bug" ? "bug" : "story";
	const draft = d.draft === true;
	session.pendingPrPreview = {
		requestId: d.requestId as string,
		title: d.title as string,
		body: d.body as string,
		prNumber,
		kind,
		itemType: kind === "backlog-item" ? itemType : undefined,
		draft: kind === "pr" && prNumber === null ? draft : undefined,
		metadata: parsePreviewMetadata(d.metadata),
	};
	if (kind !== "show") waiters.set(id, client);
	const target = previewTargetLabel(kind, itemType, prNumber, draft);
	daemonLog(
		`pr-preview set: id=${id} requestId=${d.requestId} kind=${kind} target=${target}`,
	);
	notify();
}
