import type { BacklogFilter } from "../parseBacklogFilter";
import {
	type BacklogLoadHandlers,
	revalidateBacklog,
} from "./revalidateBacklog";

// why: other machines change status in the shared DB; poll so their flips show without a reload (#418).
const POLL_INTERVAL_MS = 5000;

/**
 * Revalidate the backlog list immediately and then on an interval, returning a
 * cleanup that aborts any in-flight request and stops polling.
 */
export function startBacklogPolling(
	cwd: string | undefined,
	filter: BacklogFilter,
	handlers: BacklogLoadHandlers,
	node?: string,
): () => void {
	const controller = new AbortController();
	let inFlight = false;
	// why: a peer that never answers would otherwise stack a stuck request per tick until the browser's per-origin connection pool is exhausted and every tab stalls.
	const poll = () => {
		if (inFlight) return;
		inFlight = true;
		void revalidateBacklog(
			cwd,
			filter,
			controller.signal,
			handlers,
			node,
		).finally(() => {
			inFlight = false;
		});
	};
	poll();
	const interval = setInterval(poll, POLL_INTERVAL_MS);
	return () => {
		controller.abort();
		clearInterval(interval);
	};
}
