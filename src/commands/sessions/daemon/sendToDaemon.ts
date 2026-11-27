import { sendToDaemonAwaitAck } from "./sendToDaemonAwaitAck";

const DELIVERY_ACK_TIMEOUT_MS = 5_000;

export function sendToDaemon(
	message: Record<string, unknown>,
	timeoutMs = DELIVERY_ACK_TIMEOUT_MS,
): Promise<void> {
	return sendToDaemonAwaitAck({ ...message, deliveryAck: true }, timeoutMs);
}
