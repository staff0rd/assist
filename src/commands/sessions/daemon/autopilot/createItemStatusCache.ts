import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";

export type ItemStatusCache = ReturnType<typeof createItemStatusCache>;

/* why: the scheduler's tick is synchronous, so item statuses are read from the
 * database between ticks; a status is only trusted when the read started after
 * the run ended and after any session was last seen running the item. */
export function createItemStatusCache(deps: AutopilotDeps) {
	let statuses = new Map<number, string>();
	const lastSeen = new Map<number, number>();
	let readAt = 0;
	let reading = false;
	return {
		seen(id: number): void {
			lastSeen.set(id, Date.now());
		},
		status(id: number, runEndedAt: string): string | undefined {
			const fresh =
				readAt >= Date.parse(runEndedAt) && readAt > (lastSeen.get(id) ?? 0);
			return fresh ? statuses.get(id) : undefined;
		},
		refresh(ids: number[]): void {
			if (!deps.itemStatuses || reading || ids.length === 0) return;
			reading = true;
			const at = Date.now();
			deps
				.itemStatuses(ids)
				.then((next) => {
					statuses = next;
					readAt = at;
				})
				.catch((error: unknown) =>
					daemonLog(
						`autopilot: reading item statuses failed: ${String(error)}`,
					),
				)
				.finally(() => {
					reading = false;
				});
		},
	};
}
