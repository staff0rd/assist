import { resolveBaseRepo } from "../../prs/resolveBaseRepo";

type Repo = { org: string; repo: string };

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { value: Repo | null; expires: number }>();

function sameRepo(a: Repo, b: Repo): boolean {
	return (
		a.org.toLowerCase() === b.org.toLowerCase() &&
		a.repo.toLowerCase() === b.repo.toLowerCase()
	);
}

function resolve(cwd: string): Repo | null {
	try {
		const resolved = resolveBaseRepo(undefined, cwd);
		if (!resolved) return null;
		const pinnedOrigin = resolved.mode === "origin";
		if (!pinnedOrigin && sameRepo(resolved.base, resolved.origin)) return null;
		return resolved.base;
	} catch {
		return null;
	}
}

export function forkBaseRepo(cwd: string): Repo | null {
	const now = Date.now();
	const cached = cache.get(cwd);
	if (cached && cached.expires > now) return cached.value;
	const value = resolve(cwd);
	cache.set(cwd, { value, expires: now + CACHE_TTL_MS });
	return value;
}
