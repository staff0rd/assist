import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";

export function refuseTransfer(
	client: SessionClient,
	id: string,
	message: string,
): void {
	daemonLog(`session ${id} transfer refused: ${message}`);
	sendTo(client, { type: "error", message: `Transfer refused: ${message}` });
}
