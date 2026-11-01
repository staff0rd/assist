import type { Session } from "./createSession";
import { makeStatusChangeHandler } from "./makeStatusChangeHandler";
import {
	queuedTransferTrigger,
	type TriggerHost,
} from "./transfer/queuedTransferTrigger";

export function makeManagerStatusHandler(
	sessions: Map<string, Session>,
	host: TriggerHost,
) {
	return makeStatusChangeHandler(sessions, {
		dismiss: (id) => host.dismissSession(id),
		notify: () => host.update(() => true),
		idle: queuedTransferTrigger(host),
	});
}
