import { useCallback, useEffect, useState } from "react";

function storageKey(cwd: string): string {
	return `assist:diff-collapsed:${cwd}`;
}

function readCollapsed(cwd: string): Set<string> {
	try {
		const raw = sessionStorage.getItem(storageKey(cwd));
		if (!raw) return new Set();
		const parsed = JSON.parse(raw) as unknown;
		if (!Array.isArray(parsed)) return new Set();
		return new Set(parsed.filter((p): p is string => typeof p === "string"));
	} catch {
		return new Set();
	}
}

function writeCollapsed(cwd: string, paths: Set<string>): void {
	try {
		if (paths.size === 0) sessionStorage.removeItem(storageKey(cwd));
		else sessionStorage.setItem(storageKey(cwd), JSON.stringify([...paths]));
	} catch {}
}

export function useCollapsedFiles(cwd: string): {
	isCollapsed: (path: string) => boolean;
	toggle: (path: string) => void;
	setAll: (paths: string[], collapsed: boolean) => void;
} {
	const [collapsed, setCollapsed] = useState(() => readCollapsed(cwd));

	useEffect(() => setCollapsed(readCollapsed(cwd)), [cwd]);

	const toggle = useCallback(
		(path: string) =>
			setCollapsed((prev) => {
				const next = new Set(prev);
				if (!next.delete(path)) next.add(path);
				writeCollapsed(cwd, next);
				return next;
			}),
		[cwd],
	);

	const setAll = useCallback(
		(paths: string[], collapse: boolean) =>
			setCollapsed((prev) => {
				const next = new Set(prev);
				for (const path of paths) {
					if (collapse) next.add(path);
					else next.delete(path);
				}
				writeCollapsed(cwd, next);
				return next;
			}),
		[cwd],
	);

	return { isCollapsed: (path: string) => collapsed.has(path), toggle, setAll };
}
