import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import { daemonLog } from "./daemonLog";
import { deferredCommandLabel } from "./deferredCommandLabel";
import { formatDeferredResult } from "./formatDeferredResult";
import type { PendingDeferredCommand } from "./pendingDeferredCommandSchema";
import type { DeferredResult } from "./runDeferredCommand";
import type { Session } from "./types";
import { killedByDaemonRestart } from "./SessionInterruption";
import { untrackDeferredCommand } from "./trackDeferredCommand";

export function deliverDeferredResult(
	m: { session: (id: string) => Session | undefined },
	id: string,
	command: PendingDeferredCommand,
	result: DeferredResult,
): void {
	const name = deferredCommandLabel(command.argv);
	const label = `defer-command ${name}: session ${id} exit ${result.exitCode}`;
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
	sdk.send(formatDeferredResult(name, result));
	daemonLog(`${label} delivered as the next message`);
}
