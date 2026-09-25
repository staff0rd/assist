import type { CommitRef } from "../../../../../../../shared/db/listCommitRefs";

export const DEFAULT_DIFF_SCOPE = "all";
export const BRANCH_DIFF_SCOPE = "branch";

type DiffScopeOption = {
	value: string;
	label: string;
	note?: string;
};

export function diffScopeOptions(
	commits: CommitRef[],
	branchBase: string | null,
): DiffScopeOption[] {
	return [
		{ value: DEFAULT_DIFF_SCOPE, label: "All changes" },
		{ value: "uncommitted", label: "Uncommitted" },
		...(branchBase
			? [
					{
						value: BRANCH_DIFF_SCOPE,
						label: "Branch",
						note: `vs ${branchBase}`,
					},
				]
			: []),
		...commits.map((commit) => ({
			value: commit.sha,
			label: commit.title || commit.sha.slice(0, 7),
		})),
	];
}

export function activeDiffScope(
	options: DiffScopeOption[],
	scope: string,
): DiffScopeOption {
	return (
		options.find((option) => option.value === scope) ?? {
			value: DEFAULT_DIFF_SCOPE,
			label: "All changes",
		}
	);
}
