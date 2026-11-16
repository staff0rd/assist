import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";

export function dismissTransferError(
	s: Session | undefined,
	id: string,
): boolean {
	if (!s?.transfer?.error) {
		daemonLog(
			`session ${id} dismiss-transfer-error ignored: no failed transfer`,
		);
		return false;
	}
	daemonLog(
		`session ${id} failed transfer to ${s.transfer.target} dismissed: ${s.transfer.error}`,
	);
	s.transfer = undefined;
	return true;
}
