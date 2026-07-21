import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemon } from "./daemon/sendToDaemon";
import { sendToDaemonAwaitAck } from "./daemon/sendToDaemonAwaitAck";

const DELIVERY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 100;

type SetStatusOptions = { source?: string; ack?: boolean };

export async function setSessionStatus(
	status: string,
	opts: SetStatusOptions = {},
): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	logHookFired(status, sessionId, opts.source);
	if (!sessionId) return;
	const payload = buildPayload(sessionId, status, opts);
	if (opts.ack) await deliverReliably(sessionId, status, payload);
	else await deliverBestEffort(sessionId, status, payload);
}

function buildPayload(
	sessionId: string,
	status: string,
	opts: SetStatusOptions,
): Record<string, unknown> {
	const payload: Record<string, unknown> = {
		type: "set-status",
		sessionId,
		status,
	};
	if (opts.source) payload.source = opts.source;
	if (opts.ack) payload.ack = true;
	return payload;
}

async function deliverBestEffort(
	sessionId: string,
	status: string,
	payload: Record<string, unknown>,
): Promise<void> {
	try {
		await sendToDaemon(payload);
	} catch (error) {
		appendDaemonLog(
			`set-status best-effort send failed: id=${sessionId} status=${status}: ${describeError(error)}`,
		);
	}
}

async function deliverReliably(
	sessionId: string,
	status: string,
	payload: Record<string, unknown>,
): Promise<void> {
	for (let attempt = 1; attempt <= DELIVERY_ATTEMPTS; attempt++) {
		try {
			await sendToDaemonAwaitAck(payload);
			return;
		} catch (error) {
			if (attempt < DELIVERY_ATTEMPTS) {
				await sleep(RETRY_DELAY_MS);
				continue;
			}
			appendDaemonLog(
				`set-status ack'd delivery failed after ${DELIVERY_ATTEMPTS} attempts: id=${sessionId} status=${status}: ${describeError(error)}`,
			);
		}
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function describeError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
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
