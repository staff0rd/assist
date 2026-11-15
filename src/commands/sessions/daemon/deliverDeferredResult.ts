import { supersededPreviewMessage } from "../shared/supersededPreviewMessage";
import { daemonLog } from "./daemonLog";
import { deferredCommandLabel } from "./deferredCommandLabel";
import { formatDeferredResult } from "./formatDeferredResult";
import type { PendingDeferredCommand } from "./pendingDeferredCommandSchema";
import type { DeferredResult } from "./runDeferredCommand";
import type { DeferredDeliveryHost } from "./DeferredDeliveryHost";
import { killedByDaemonRestart } from "./SessionInterruption";
import { untrackDeferredCommand } from "./trackDeferredCommand";
import { typeDeferredResult } from "./typeDeferredResult";

export function deliverDeferredResult(
	m: DeferredDeliveryHost,
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
	if (!session?.pty || session.status === "done") {
		daemonLog(`${label} dropped: session is gone`);
		return;
	}
	const text = formatDeferredResult(name, result);
	if (session.pty.sdk) {
		session.pty.sdk.send(text);
		daemonLog(`${label} delivered as the next message`);
		return;
	}
	const typed = typeDeferredResult(session, text, m);
	daemonLog(
		typed === "typed"
			? `${label} typed into the terminal as the next turn`
			: `${label} queued until the session is idle`,
	);
}
