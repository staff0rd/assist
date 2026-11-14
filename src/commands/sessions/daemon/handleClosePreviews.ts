import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;

export function handleClosePreviews(
	client: SessionClient,
	m: SessionManager,
	d: Msg,
): void {
	const sessionId = d.sessionId as string;
	const reason = (d.reason as string | undefined) ?? "previews closed";
	daemonLog(`close-previews received: id=${sessionId} (${reason})`);
	// why: ack before routing — a linked peer never acks back over the link
	sendTo(client, { type: "ack", sessionId });
	if (m.links.route(client, d)) return;
	m.prPreview.closeAll(sessionId, reason);
}
