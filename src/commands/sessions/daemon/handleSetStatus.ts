import { type SessionClient, sendTo } from "./broadcast";
import type { SessionStatus } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { SessionManager } from "./SessionManager";

type Msg = Record<string, unknown>;

export function handleSetStatus(
	client: SessionClient,
	m: SessionManager,
	d: Msg,
): void {
	daemonLog(
		`set-status received: id=${d.sessionId} status=${d.status}${d.source ? ` source=${d.source}` : ""}`,
	);
	if (m.windowsProxy.route(client, d)) return;
	m.setStatus(
		d.sessionId as string,
		d.status as SessionStatus,
		d.source as string | undefined,
	);
	if (d.ack) sendTo(client, { type: "ack", sessionId: d.sessionId });
}
