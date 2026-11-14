import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import { daemonLog } from "./daemonLog";
import { formatDeferredResult } from "./formatDeferredResult";
import type { DeferredResult } from "./runDeferredCommand";
import type { SessionManager } from "./SessionManager";
import { killedByDaemonRestart } from "./SessionInterruption";
import { untrackDeferredCommand } from "./trackDeferredCommand";

export function deliverDeferredResult(
	m: SessionManager,
	id: string,
	command: string,
	result: DeferredResult,
): void {
	const label = `defer-command ${command}: session ${id} exit ${result.exitCode}`;
	const session = m.session(id);
	if (session && killedByDaemonRestart(session.interrupted)) {
		daemonLog(`${label} killed by the daemon restart; left pending`);
		return;
	}
	if (session) untrackDeferredCommand(session, command);
	if (
		result.exitCode === 0 &&
		result.output.includes(supersededPreviewMessage)
	) {
		daemonLog(`${label} superseded; nothing delivered`);
		return;
	}
	const sdk = session?.pty?.sdk;
	if (!sdk) {
		daemonLog(`${label} dropped: session is gone`);
		return;
	}
	sdk.send(formatDeferredResult(command, result));
	daemonLog(`${label} delivered as the next message`);
}
