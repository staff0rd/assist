import { useSyncExternalStore } from "react";

const STORAGE_KEY = "backlog-show-completed";

const listeners = new Set<() => void>();
let current = readFromStorage();

function readFromStorage(): boolean {
	try {
		return localStorage.getItem(STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

function subscribe(cb: () => void) {
	listeners.add(cb);
	return () => listeners.delete(cb);
}

function getSnapshot() {
	return current;
}

function setShowCompleted(next: boolean) {
	current = next;
	try {
		localStorage.setItem(STORAGE_KEY, String(next));
	} catch {}
	for (const cb of listeners) cb();
}

export function useShowCompleted() {
	const value = useSyncExternalStore(subscribe, getSnapshot);
	return [value, setShowCompleted] as const;
}
