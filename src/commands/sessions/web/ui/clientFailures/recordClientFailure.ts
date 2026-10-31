import type { ClientFailure } from "../../../shared/ClientFailure";
import { queueClientFailureReport } from "./queueClientFailureReport";

const MAX_RECENT = 100;

let recent: ClientFailure[] = [];
const listeners = new Set<() => void>();

function publish(next: ClientFailure[]): void {
	recent = next;
	for (const listener of listeners) listener();
}

export function recordClientFailure(failure: ClientFailure): void {
	publish([failure, ...recent].slice(0, MAX_RECENT));
	queueClientFailureReport(failure);
}

export function getClientFailures(): ClientFailure[] {
	return recent;
}

export function clearClientFailures(): void {
	publish([]);
}

export function subscribeClientFailures(listener: () => void): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}
