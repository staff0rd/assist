import { useSyncExternalStore } from "react";

const reopening = new Map<string, number>();
const listeners = new Set<() => void>();

function notify() {
	for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

export function markReopeningHighLevelReview(
	sessionId: string,
	prNumber: number,
): boolean {
	if (reopening.has(sessionId)) return false;
	reopening.set(sessionId, prNumber);
	notify();
	return true;
}

export function clearReopeningHighLevelReview(sessionId: string) {
	if (reopening.delete(sessionId)) notify();
}

const serverSnapshot = () => undefined;

export function useReopeningHighLevelReview(
	sessionId: string | undefined,
): number | undefined {
	return useSyncExternalStore(
		subscribe,
		() => (sessionId ? reopening.get(sessionId) : undefined),
		serverSnapshot,
	);
}
