import type { CommitRef } from "../../../shared/db/listCommitRefs";
import type { ConversationTarget } from "../shared/sessionConversationTarget";
import { itemCommits } from "./itemCommits";
import { resolveCommitCached } from "./resolveCommitCached";
import { transcriptCommits } from "./transcriptCommits";
import { withTimeout } from "../../../shared/withTimeout";

type CommittedPaths = { commits: CommitRef[]; bases: Map<string, string> };

const cache = new Map<string, { value: CommittedPaths; expiresAt: number }>();

const inFlight = new Map<string, Promise<CommittedPaths>>();

const CACHE_TTL_MS = 10_000;

const LOOKUP_TIMEOUT_MS = 10_000;

export async function committedPaths(
	cwd: string,
	session: ConversationTarget,
): Promise<CommittedPaths> {
	const key = `${cwd} ${session.harness ?? ""}:${session.conversationId}`;
	const cached = cache.get(key);
	if (cached && cached.expiresAt > Date.now()) return cached.value;

	const pending = inFlight.get(key);
	if (pending) return pending;

	const lookup = withTimeout(
		loadCommittedPaths(key, cwd, session),
		LOOKUP_TIMEOUT_MS,
		"committed paths",
	)
		.then((value) => {
			cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
			return value;
		})
		.finally(() => inFlight.delete(key));
	inFlight.set(key, lookup);
	return lookup;
}

async function loadCommittedPaths(
	key: string,
	cwd: string,
	session: ConversationTarget,
): Promise<CommittedPaths> {
	const itemCommitRefs = await itemCommits(session.conversationId);
	const commits =
		itemCommitRefs.length > 0
			? itemCommitRefs
			: await transcriptCommits(cwd, session);
	const bases = new Map<string, string>();
	for (const commit of commits) {
		const resolved = await resolveCommitCached(key, cwd, commit.sha);
		if (!resolved) continue;
		for (const path of resolved.paths) {
			if (!bases.has(path)) bases.set(path, resolved.base);
		}
	}
	return { commits, bases };
}
