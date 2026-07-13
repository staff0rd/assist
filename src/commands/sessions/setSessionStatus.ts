import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemon } from "./daemon/sendToDaemon";

const DELIVERY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 100;

export async function setSessionStatus(status: string): Promise<void> {
	const sessionId = process.env.ASSIST_SESSION_ID;
	logHookFired(status, sessionId);
	if (!sessionId) return;
	await deliverStatus(sessionId, status);
}

async function deliverStatus(sessionId: string, status: string): Promise<void> {
	const payload = { type: "set-status", sessionId, status };
	for (let attempt = 1; attempt <= DELIVERY_ATTEMPTS; attempt++) {
		try {
			await sendToDaemon(payload);
			return;
		} catch (error) {
			if (attempt < DELIVERY_ATTEMPTS) {
				await sleep(RETRY_DELAY_MS);
				continue;
			}
			appendDaemonLog(
				`set-status delivery failed after ${DELIVERY_ATTEMPTS} attempts: id=${sessionId} status=${status}: ${describeError(error)}`,
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

function logHookFired(status: string, sessionId: string | undefined): void {
	appendDaemonLog(
		`set-status hook fired: id=${sessionId ?? "none"} status=${status}`,
	);
}
