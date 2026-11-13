import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import type { OnStatusChange } from "./types";

export function wireSdkEvents(
	session: Session,
	onStatusChange: OnStatusChange,
	notify?: () => void,
): void {
	session.pty?.sdk?.onEvent((event) => {
		if (session.status === "done" || session.status === "stopped") return;
		if (event.kind === "activity") {
			session.sdkActivity = event.text ?? undefined;
			daemonLog(
				`session ${session.id} sdk activity: ${event.text ?? "cleared"}`,
			);
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
