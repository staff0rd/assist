import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "assist.phone.repoFilter";
const listeners = new Set<() => void>();
let unstored: string | null = null;

function readRepo(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return unstored;
	}
}

function writeRepo(repo: string | null): void {
	unstored = repo;
	try {
		if (repo === null) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, repo);
	} catch {}
}

function subscribe(listener: () => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function usePhoneRepoFilter(): [
	string | null,
	(repo: string | null) => void,
] {
	const repo = useSyncExternalStore(subscribe, readRepo);
	const select = useCallback((next: string | null) => {
		writeRepo(next);
		for (const listener of listeners) listener();
	}, []);
	return [repo, select];
}
