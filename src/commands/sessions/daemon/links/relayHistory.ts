import type { HistoricalSession } from "../../shared/parseSessionFile";
import { daemonLog } from "../daemonLog";
import type { LinkRelayState } from "./LinkRelayState";

export function relayHistory(
	state: LinkRelayState,
	msg: Record<string, unknown>,
): void {
	const sessions = ((msg.sessions as HistoricalSession[]) ?? []).map((s) => ({
		...s,
		node: state.node,
	}));
	const changed =
		JSON.stringify(sessions) !== JSON.stringify(state.lastHistory);
	state.lastHistory = sessions;
	const waiter = state.historyWaiters.shift();
	if (waiter) waiter(sessions);
	else if (changed) {
		daemonLog(`link ${state.node} ws: late history reply changed, pushing`);
		state.onHistoryChanged();
	}
}
