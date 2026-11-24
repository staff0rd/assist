import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";
import { applySdkViewEvent } from "./applySdkViewEvent";
import { bindDrivenConversation } from "./bindDrivenConversation";
import { takeHeldShellResults } from "./shell/takeHeldShellResults";

export function wireSdkEvents(
	session: Session,
	onStatusChange: OnStatusChange,
	notify?: () => void,
): void {
	session.sdkBackgroundTasks = undefined;
	session.sdkBackgroundTasksSince = undefined;
	session.pty?.sdk?.setPrefix?.(() => takeHeldShellResults(session, notify));
	session.pty?.sdk?.onEvent((event) => {
		if (session.status === "done" || session.status === "stopped") return;
		if (event.kind === "conversation") {
			bindDrivenConversation(session, event.id, notify, onStatusChange);
			return;
		}
		if (event.kind !== "status") {
			applySdkViewEvent(session, event);
			notify?.();
			return;
		}
		if (event.status === session.status) return;
		daemonLog(
			`session ${session.id} status from sdk: ${session.status} -> ${event.status}`,
		);
		session.permissionActive = false;
		if (event.status === "running") session.sdkPromptSuggestion = undefined;
		onStatusChange(session, event.status);
	});
}
