import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";

export function cancelQueuedTransfer(
	s: Session | undefined,
	id: string,
): boolean {
	if (!s?.transfer?.queued) {
		daemonLog(`session ${id} cancel-transfer ignored: no pending transfer`);
		return false;
	}
	daemonLog(`session ${id} pending transfer to ${s.transfer.target} cancelled`);
	s.transfer = undefined;
	return true;
}
