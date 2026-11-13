const POLL_INTERVAL_MS = 5000;
const MAX_POLL_INTERVAL_MS = 60_000;

export function pollBackoffDelay(consecutiveFailures: number): number {
	const backoff = 2 ** Math.max(0, consecutiveFailures - 1);
	return Math.min(POLL_INTERVAL_MS * backoff, MAX_POLL_INTERVAL_MS);
}
