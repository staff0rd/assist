import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { readHookClaudeSessionId } from "./readHookClaudeSessionId";
import { deliverSetStatus } from "./deliverSetStatus";

const RELIABLE_ATTEMPTS = 3;
type SetStatusOptions = {
	source?: string;
	ack?: boolean;
	readsClaudeHookInput?: boolean;
};

// why: every set-status awaits the daemon's ack, even a best-effort hint. The
// daemon greets each connection with the full scrollback replay, so a
// fire-and-forget hook that exits right after writing closes its socket with
// unread data, resetting the daemon's end before it has read the line.
export async function setSessionStatus(
	status: string,
	opts: SetStatusOptions = {},
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	logHookFired(status, sessionId, opts.source);
	if (!sessionId) return;
	const payload = buildPayload(
		sessionId,
		status,
		opts.source,
		opts.readsClaudeHookInput === false
			? undefined
			: await readHookClaudeSessionId(),
	);
	await deliverSetStatus(
		sessionId,
		status,
		payload,
		opts.ack ? RELIABLE_ATTEMPTS : 1,
	);
}

function buildPayload(
	sessionId: string,
	status: string,
	source: string | undefined,
	claudeSessionId: string | undefined,
): Record<string, unknown> {
	const payload: Record<string, unknown> = {
		type: "set-status",
		sessionId,
		status,
	};
	if (claudeSessionId) payload.claudeSessionId = claudeSessionId;
	if (source) payload.source = source;
	payload.ack = true;
	return payload;
}

function logHookFired(
	status: string,
	sessionId: string | undefined,
	source: string | undefined,
): void {
	appendDaemonLog(
		`set-status hook fired: id=${sessionId ?? "none"} status=${status}${source ? ` source=${source}` : ""}`,
	);
}
