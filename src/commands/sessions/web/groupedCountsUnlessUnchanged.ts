import { groupedCounts } from "./groupedCounts";
import type { ChangeGroup } from "./itemChangeSet";
import { itemCountsFingerprint } from "./itemCountsFingerprint";
import type { GitStatusCounts } from "./parseGitStatus";

const RECOUNT_AFTER_MS = 30_000;

const counted = new Map<
	string,
	{ fingerprint: string; counts: GitStatusCounts; expiresAt: number }
>();

const counting = new Map<
	string,
	{ fingerprint: string; counts: Promise<GitStatusCounts> }
>();

function remember(
	scope: string,
	fingerprint: string,
	counts: GitStatusCounts,
): void {
	const now = Date.now();
	for (const [other, entry] of counted) {
		if (entry.expiresAt <= now) counted.delete(other);
	}
	counted.set(scope, {
		fingerprint,
		counts,
		expiresAt: now + RECOUNT_AFTER_MS,
	});
}

function recalled(
	scope: string,
	fingerprint: string,
): GitStatusCounts | undefined {
	const known = counted.get(scope);
	const fresh =
		known?.fingerprint === fingerprint && known.expiresAt > Date.now();
	return fresh ? known.counts : undefined;
}

export async function groupedCountsUnlessUnchanged(
	scope: string,
	cwd: string,
	groups: ChangeGroup[],
	uncommitted: GitStatusCounts,
): Promise<GitStatusCounts> {
	const fingerprint = await itemCountsFingerprint(cwd, groups, uncommitted);
	const known = recalled(scope, fingerprint);
	if (known) return known;

	const pending = counting.get(scope);
	if (pending?.fingerprint === fingerprint) return pending.counts;

	const counts = groupedCounts(cwd, groups)
		.then((result) => {
			remember(scope, fingerprint, result);
			return result;
		})
		.finally(() => {
			if (counting.get(scope)?.counts === counts) counting.delete(scope);
		});
	counting.set(scope, { fingerprint, counts });
	return counts;
}
