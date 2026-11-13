import type { SdkSessionEvent } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";

function applyViewEvent(
	session: Session,
	event: Exclude<SdkSessionEvent, { kind: "status" }>,
): void {
	if (event.kind === "activity") {
		session.sdkActivity = event.text ?? undefined;
		daemonLog(`session ${session.id} sdk activity: ${event.text ?? "cleared"}`);
	} else if (event.kind === "queued") {
		session.sdkQueued = event.texts.length ? event.texts : undefined;
		daemonLog(`session ${session.id} sdk queued: ${event.texts.length}`);
	} else if (event.kind === "background") {
		session.sdkBackgroundTasks = event.tasks.length ? event.tasks : undefined;
		daemonLog(
			`session ${session.id} sdk background tasks: ${event.tasks.length}`,
		);
	} else if (event.kind === "resumed") {
		session.sdkResuming = undefined;
		daemonLog(`session ${session.id} sdk resumed: composer unlocked`);
	} else {
		session.sdkInterrupting = event.pending || undefined;
		daemonLog(
			`session ${session.id} sdk interrupt ${event.pending ? "pending" : "landed"}`,
		);
	}
}

export function wireSdkEvents(
	session: Session,
	onStatusChange: OnStatusChange,
	notify?: () => void,
): void {
	session.sdkBackgroundTasks = undefined;
	session.pty?.sdk?.onEvent((event) => {
		if (session.status === "done" || session.status === "stopped") return;
		if (event.kind !== "status") {
			applyViewEvent(session, event);
			notify?.();
			return;
		}
		if (event.status === session.status) return;
		daemonLog(
			`session ${session.id} status from sdk: ${session.status} -> ${event.status}`,
		);
		session.permissionActive = false;
		onStatusChange(session, event.status);
	});
}
