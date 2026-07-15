import type { BacklogFilter } from "../parseBacklogFilter";
import { revalidateBacklog } from "./revalidateBacklog";
import type { BacklogItemSummary } from "./types";

// why: other machines change status in the shared DB; poll so their flips show without a reload (#418).
const POLL_INTERVAL_MS = 5000;

type Apply = (found: boolean, items: BacklogItemSummary[]) => void;

/**
 * Revalidate the backlog list immediately and then on an interval, returning a
 * cleanup that aborts any in-flight request and stops polling.
 */
export function startBacklogPolling(
	cwd: string | undefined,
	filter: BacklogFilter,
	apply: Apply,
): () => void {
	const controller = new AbortController();
	const poll = () => revalidateBacklog(cwd, filter, controller.signal, apply);
	poll();
	const interval = setInterval(poll, POLL_INTERVAL_MS);
	return () => {
		controller.abort();
		clearInterval(interval);
	};
}
