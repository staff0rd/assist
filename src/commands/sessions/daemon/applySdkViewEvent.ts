import type { SdkSessionEvent } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function applySdkViewEvent(
	session: Session,
	event: Exclude<SdkSessionEvent, { kind: "status" }>,
): void {
	if (event.kind === "activity") {
		session.sdkActivity = event.text ?? undefined;
		daemonLog(`session ${session.id} sdk activity: ${event.text ?? "cleared"}`);
	} else if (event.kind === "elapsed") {
		session.sdkActivityElapsed = event.seconds ?? undefined;
	} else if (event.kind === "process") {
		session.sdkProcess = event.process ?? undefined;
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
