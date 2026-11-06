import { appendDaemonLog } from "./daemon/appendDaemonLog";
import { sendToDaemonAwaitAck } from "./daemon/sendToDaemonAwaitAck";

const RETRY_DELAY_MS = 100;

export async function deliverSetStatus(
	sessionId: string,
	status: string,
	payload: Record<string, unknown>,
	attempts: number,
): Promise<void> {
	for (let attempt = 1; attempt <= attempts; attempt++) {
		try {
			await sendToDaemonAwaitAck(payload);
			return;
		} catch (error) {
			if (attempt < attempts) {
				await sleep(RETRY_DELAY_MS);
				continue;
			}
			appendDaemonLog(
				`set-status delivery failed after ${attempts} attempt${attempts === 1 ? "" : "s"}: id=${sessionId} status=${status}${payload.source ? ` source=${payload.source}` : ""}: ${describeError(error)}`,
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
