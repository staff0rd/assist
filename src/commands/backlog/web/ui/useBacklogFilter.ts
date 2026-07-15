import { useSyncExternalStore } from "react";
import { type BacklogFilter, parseBacklogFilter } from "../parseBacklogFilter";

const STORAGE_KEY = "backlog-filter";

const listeners = new Set<() => void>();
let current = readFromStorage();

function readFromStorage(): BacklogFilter {
	try {
		return parseBacklogFilter(localStorage.getItem(STORAGE_KEY));
	} catch {
		return "todo";
	}
}

function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

function getSnapshot() {
	return current;
}

function setBacklogFilter(next: BacklogFilter) {
	current = next;
	try {
		localStorage.setItem(STORAGE_KEY, next);
	} catch {}
	for (const cb of listeners) cb();
}

export function useBacklogFilter() {
	const value = useSyncExternalStore(subscribe, getSnapshot);
	return [value, setBacklogFilter] as const;
}
