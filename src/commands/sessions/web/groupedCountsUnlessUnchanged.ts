import { execGit } from "./execGit";
import { groupedCounts } from "./groupedCounts";
import type { ChangeGroup } from "./itemChangeSet";
import type { GitStatusCounts } from "./parseGitStatus";

const RECOUNT_AFTER_MS = 30_000;

const counted = new Map<
	string,
	{ fingerprint: string; counts: GitStatusCounts; expiresAt: number }
>();

async function headCommit(cwd: string): Promise<string> {
	try {
		return (await execGit(cwd, ["rev-parse", "HEAD"])).trim();
	} catch {
		return "";
	}
}

export async function groupedCountsUnlessUnchanged(
	scope: string,
	cwd: string,
	groups: ChangeGroup[],
	uncommitted: GitStatusCounts,
): Promise<GitStatusCounts> {
	const fingerprint = JSON.stringify([
		await headCommit(cwd),
		groups,
		uncommitted,
	]);
	const now = Date.now();
	const known = counted.get(scope);
	if (known && known.fingerprint === fingerprint && known.expiresAt > now)
		return known.counts;
	const counts = await groupedCounts(cwd, groups);
	for (const [other, entry] of counted) {
		if (entry.expiresAt <= now) counted.delete(other);
	}
	counted.set(scope, {
		fingerprint,
		counts,
		expiresAt: now + RECOUNT_AFTER_MS,
	});
	return counts;
}
