import { daemonLog } from "../daemonLog";
import type { AutopilotDeps } from "./AutopilotDeps";

export type ItemStatusCache = ReturnType<typeof createItemStatusCache>;

/* why: the scheduler's tick is synchronous, so item statuses are read from the
 * database between ticks and only trusted once read after a run ended. */
export function createItemStatusCache(deps: AutopilotDeps) {
	let statuses = new Map<number, string>();
	let readAt = 0;
	let reading = false;
	return {
		status: (id: number, notBefore: string): string | undefined =>
			readAt >= Date.parse(notBefore) ? statuses.get(id) : undefined,
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
