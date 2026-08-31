import { fetchIssueNodeId } from "./fetchIssueNodeId";
import { resolveFixStructureTarget } from "./fixStructure/resolveFixStructureTarget";
import type { IssueRepoTarget } from "./resolveIssueRepoTarget";

export type CreateIssueParent = {
	owner: string;
	repo: string;
	number: number;
	id: string;
};

export function resolveCreateIssueParent(
	target: IssueRepoTarget,
	parent: string,
): CreateIssueParent {
	const reference = resolveFixStructureTarget(
		parent,
		`${target.owner}/${target.repo}`,
	);
	return { ...reference, id: fetchIssueNodeId(reference) };
}
