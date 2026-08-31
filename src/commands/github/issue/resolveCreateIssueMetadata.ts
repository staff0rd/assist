import { resolveIssueType } from "./fixStructure/resolveIssueType";
import { resolveOrgIssueTypes } from "./fixStructure/resolveOrgIssueTypes";
import type { IssueType } from "./fixStructure/types";
import {
	type CreateIssueMetadataOptions,
	hasCreateIssueMetadataOptions,
} from "./hasCreateIssueMetadataOptions";
import { resolveIssueLabels } from "./resolveIssueLabels";
import {
	type IssueRepoTarget,
	resolveIssueRepoTarget,
} from "./resolveIssueRepoTarget";
import {
	type CreateIssueParent,
	resolveCreateIssueParent,
} from "./resolveCreateIssueParent";
import {
	type CreateIssueProject,
	resolveCreateIssueProject,
} from "./resolveCreateIssueProject";

export type CreateIssueMetadata = {
	target: IssueRepoTarget;
	issueType?: IssueType;
	parent?: CreateIssueParent;
	project?: CreateIssueProject;
	labels?: string[];
};

export function resolveCreateIssueMetadata(
	options: CreateIssueMetadataOptions,
): CreateIssueMetadata | undefined {
	if (!hasCreateIssueMetadataOptions(options)) return undefined;
	const labels = options.label ?? [];
	const target = resolveIssueRepoTarget(options.repo);
	return {
		target,
		issueType: options.type
			? resolveIssueType(resolveOrgIssueTypes(target.owner), options.type)
			: undefined,
		parent: options.parent
			? resolveCreateIssueParent(target, options.parent)
			: undefined,
		project: options.project
			? resolveCreateIssueProject(target.owner, options.project, options.status)
			: undefined,
		labels: labels.length ? resolveIssueLabels(target, labels) : undefined,
	};
}
