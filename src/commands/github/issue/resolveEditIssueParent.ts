import { failParentChange } from "./failParentChange";
import { fetchIssueNodeId } from "./fetchIssueNodeId";
import {
	type CreateIssueParent,
	resolveCreateIssueParent,
} from "./resolveCreateIssueParent";
import { resolveIssueRepoTarget } from "./resolveIssueRepoTarget";

export type EditIssueParent = {
	child: string;
	childId: string;
	parent: CreateIssueParent;
	label: string;
};

export function resolveEditIssueParent(
	number: number,
	repo: string | undefined,
	parentArg: string,
): EditIssueParent {
	const target = resolveIssueRepoTarget(repo);
	const child = `${target.owner}/${target.repo}#${number}`;
	try {
		const childId = fetchIssueNodeId({ ...target, number });
		const parent = resolveCreateIssueParent(target, parentArg);
		return {
			child,
			childId,
			parent,
			label: `${parent.owner}/${parent.repo}#${parent.number}`,
		};
	} catch (error) {
		failParentChange(child, error);
	}
}
