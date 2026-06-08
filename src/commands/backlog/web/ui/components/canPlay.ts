import type { BacklogStatus } from "../types";

/**
 * An item can be built whenever it is open work — todo or in-progress. A plan is
 * not a prerequisite (a run can start without one), so this depends only on
 * status, which keeps it usable for both the list summary and the full item.
 */
export function canPlay(item: { status: BacklogStatus }): boolean {
	return item.status === "todo" || item.status === "in-progress";
}
