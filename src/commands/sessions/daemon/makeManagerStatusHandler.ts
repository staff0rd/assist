import type { Session } from "./createSession";
import type { DeferredDeliveryHost } from "./DeferredDeliveryHost";
import { flushDeferredResults } from "./flushDeferredResults";
import { makeStatusChangeHandler } from "./makeStatusChangeHandler";
import {
	queuedTransferTrigger,
	type TriggerHost,
} from "./transfer/queuedTransferTrigger";

export function makeManagerStatusHandler(
	sessions: Map<string, Session>,
	host: TriggerHost & DeferredDeliveryHost,
) {
	const transfer = queuedTransferTrigger(host);
	return makeStatusChangeHandler(sessions, {
		dismiss: (id, closeServerRuns) => host.dismissSession(id, closeServerRuns),
		notify: () => host.update(() => true),
		idle: (session) => {
			flushDeferredResults(session, host);
			transfer(session);
		},
	});
}
