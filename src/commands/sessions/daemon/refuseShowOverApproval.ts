import { type SessionClient, sendTo } from "./broadcast";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { previewTargetLabel } from "./previewTargetLabel";

export function refuseShowOverApproval(
	session: Session,
	client: SessionClient,
	d: Record<string, unknown>,
): boolean {
	const pending = session.pendingPrPreview;
	if (!pending || pending.kind === "show") return false;
	const target = previewTargetLabel(
		pending.kind ?? "pr",
		pending.itemType ?? "story",
		pending.prNumber,
		pending.draft === true,
	);
	daemonLog(
		`pr-preview show refused: id=${session.id} requestId=${d.requestId} pending=${target}`,
	);
	sendTo(client, {
		type: "show-refused",
		requestId: d.requestId,
		message: `A ${target} preview is awaiting approval in this session's preview pane; approve or reject it before showing anything else.`,
	});
	return true;
}
