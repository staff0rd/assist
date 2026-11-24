import { failEditIssueChange } from "./failEditIssueChange";
import { fetchIssueNodeId } from "./fetchIssueNodeId";
import { resolveIssueType } from "./fixStructure/resolveIssueType";
import { resolveOrgIssueTypes } from "./fixStructure/resolveOrgIssueTypes";
import type { IssueType } from "./fixStructure/types";
import {
	type CreateIssueParent,
	resolveCreateIssueParent,
} from "./resolveCreateIssueParent";
import { resolveIssueRepoTarget } from "./resolveIssueRepoTarget";

export type EditIssueMetadata = {
	child: string;
	childId: string;
	issueType?: IssueType;
	parent?: CreateIssueParent & { label: string };
};

type EditIssueMetadataArgs = {
	parent?: string;
	type?: string;
};

export function resolveEditIssueMetadata(
	number: number,
	repo: string | undefined,
	args: EditIssueMetadataArgs,
): EditIssueMetadata | undefined {
	if (!args.parent && !args.type) return undefined;
	const target = resolveIssueRepoTarget(repo);
	const child = `${target.owner}/${target.repo}#${number}`;

	let issueType: IssueType | undefined;
	if (args.type) {
		try {
			issueType = resolveIssueType(
				resolveOrgIssueTypes(target.owner),
				args.type,
			);
		} catch (error) {
			failEditIssueChange(`the issue type of ${child}`, error);
		}
	}

	const change = args.parent
		? `the parent of ${child}`
		: `the issue type of ${child}`;
	try {
		const childId = fetchIssueNodeId({ ...target, number });
		if (!args.parent) return { child, childId, issueType };
		const parent = resolveCreateIssueParent(target, args.parent);
		return {
			child,
			childId,
			issueType,
			parent: {
				...parent,
				label: `${parent.owner}/${parent.repo}#${parent.number}`,
			},
		};
	} catch (error) {
		failEditIssueChange(change, error);
	}
}
