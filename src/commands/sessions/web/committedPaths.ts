import type { CommitRef } from "../../../shared/db/listCommitRefs";
import { itemCommits } from "./itemCommits";
import { resolveCommit } from "./resolveCommit";
import { transcriptCommits } from "./transcriptCommits";

type CommittedPaths = { commits: CommitRef[]; bases: Map<string, string> };

const cache = new Map<string, { value: CommittedPaths; expiresAt: number }>();

const inFlight = new Map<string, Promise<CommittedPaths>>();

const CACHE_TTL_MS = 10_000;

export async function committedPaths(
	cwd: string,
	sessionId: string,
): Promise<CommittedPaths> {
	const key = `${cwd} ${sessionId}`;
	const cached = cache.get(key);
	if (cached && cached.expiresAt > Date.now()) return cached.value;

	const pending = inFlight.get(key);
	if (pending) return pending;

	const lookup = loadCommittedPaths(cwd, sessionId)
		.then((value) => {
			cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
			return value;
		})
		.finally(() => inFlight.delete(key));
	inFlight.set(key, lookup);
	return lookup;
}

async function loadCommittedPaths(
	cwd: string,
	sessionId: string,
): Promise<CommittedPaths> {
	const itemCommitRefs = await itemCommits(sessionId);
	const commits =
		itemCommitRefs.length > 0
			? itemCommitRefs
			: await transcriptCommits(cwd, sessionId);
	const bases = new Map<string, string>();
	for (const commit of commits) {
		const resolved = await resolveCommit(cwd, commit.sha);
		if (!resolved) continue;
		for (const path of resolved.paths) {
			if (!bases.has(path)) bases.set(path, resolved.base);
		}
	}
	return { commits, bases };
}
