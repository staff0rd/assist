import type { HistoricalSession } from "../../shared/parseSessionFile";
import { daemonLog } from "../daemonLog";
import type { LinkContext } from "./LinkContext";
import { sendToLink } from "./setLinkState";

const HISTORY_TIMEOUT_MS = 5_000;

export function requestLinkHistory(
	ctx: LinkContext,
): Promise<HistoricalSession[]> {
	if (!ctx.greeted) return Promise.resolve([]);
	const waiters = ctx.relay.historyWaiters;
	return new Promise((resolve) => {
		const settle = (sessions: HistoricalSession[]) => {
			clearTimeout(timer);
			resolve(sessions);
		};
		const timer = setTimeout(() => {
			const index = waiters.indexOf(settle);
			if (index !== -1) waiters.splice(index, 1);
			daemonLog(`link ${ctx.spec.name} ws: history timed out`);
			resolve([]);
		}, HISTORY_TIMEOUT_MS);
		timer.unref?.();
		waiters.push(settle);
		sendToLink(ctx, { type: "history" });
	});
}
