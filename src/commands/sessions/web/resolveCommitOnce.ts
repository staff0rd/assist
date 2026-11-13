import { resolveCommit } from "./resolveCommit";

type ResolvedCommit = NonNullable<Awaited<ReturnType<typeof resolveCommit>>>;

const immutableCommits = new Map<string, ResolvedCommit>();

export async function resolveCommitOnce(
	scope: string,
	cwd: string,
	sha: string,
): Promise<ResolvedCommit | undefined> {
	const key = `${scope} ${sha}`;
	const known = immutableCommits.get(key);
	if (known) return known;
	const found = await resolveCommit(cwd, sha);
	if (found && found.paths.length > 0) immutableCommits.set(key, found);
	return found;
}
