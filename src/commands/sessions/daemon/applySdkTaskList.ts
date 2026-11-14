import type { SdkSessionEvent } from "../../../shared/harnessAdapters/types";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function applySdkTaskList(
	session: Session,
	event: Extract<SdkSessionEvent, { kind: "pending" | "background" }>,
): void {
	if (event.kind === "pending") {
		session.sdkPending = event.texts.length
			? [...(session.sdkPending ?? []), ...event.texts]
			: undefined;
		daemonLog(
			`session ${session.id} sdk pending: ${session.sdkPending?.length ?? 0}`,
		);
		return;
	}
	session.sdkBackgroundTasks = event.tasks.length ? event.tasks : undefined;
	daemonLog(
		`session ${session.id} sdk background tasks: ${event.tasks.length}`,
	);
}
