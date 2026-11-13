import { type ResolvedCommit, resolveCommit } from "./resolveCommit";

const REVALIDATE_AFTER_MS = 10 * 60_000;

const resolved = new Map<
	string,
	{ commit: ResolvedCommit; expiresAt: number }
>();

export async function resolveCommitCached(
	scope: string,
	cwd: string,
	sha: string,
): Promise<ResolvedCommit | undefined> {
	const key = `${scope} ${sha}`;
	const known = resolved.get(key);
	if (known && known.expiresAt > Date.now()) return known.commit;
	const found = await resolveCommit(cwd, sha);
	if (found?.pathsListed) remember(key, found);
	else resolved.delete(key);
	return found;
}

function remember(key: string, commit: ResolvedCommit): void {
	const now = Date.now();
	for (const [other, entry] of resolved) {
		if (entry.expiresAt <= now) resolved.delete(other);
	}
	resolved.set(key, { commit, expiresAt: now + REVALIDATE_AFTER_MS });
}
