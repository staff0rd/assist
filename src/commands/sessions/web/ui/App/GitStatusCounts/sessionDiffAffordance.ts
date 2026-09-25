import type { ItemStatusCounts } from "../../../gitStatus";
import type { GitStatusCounts as Counts } from "../../../parseGitStatus";
import type { StatusGroup } from "./CountsLink";
import { GROUPS } from "./GitStatusLink";

type SessionDiffAffordance =
	| { kind: "counts"; groups: StatusGroup[]; uncommitted?: StatusGroup[] }
	| { kind: "branch"; defaultBranch: string };

function toGroups(counts: Partial<Counts>): StatusGroup[] {
	return GROUPS.map((group) => ({
		...group,
		count: counts[group.key]?.length ?? 0,
	})).filter((group) => group.count > 0);
}

export function sessionDiffAffordance(
	counts: ItemStatusCounts | null,
): SessionDiffAffordance | null {
	if (!counts) return null;

	const groups = toGroups(counts);
	const uncommitted =
		counts.hasCommits && counts.uncommitted
			? toGroups(counts.uncommitted)
			: undefined;

	if (groups.length > 0 || (uncommitted?.length ?? 0) > 0)
		return { kind: "counts", groups, uncommitted };

	if (counts.defaultBranch && counts.onDefaultBranch === false)
		return { kind: "branch", defaultBranch: counts.defaultBranch };

	return null;
}
