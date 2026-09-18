import {
	type IssueProjectItem,
	type ProjectItemNode,
	toIssueProjectItem,
} from "./toIssueProjectItem";

type IssueProjectItemsResponse = {
	data?: {
		repository?: {
			issue?: {
				id?: string;
				projectItems?: { nodes?: (ProjectItemNode | null)[] } | null;
			} | null;
		} | null;
	};
};

export function parseIssueProjectItems(
	raw: string,
	label: string,
): { issueId: string; items: IssueProjectItem[] } {
	const issue = (JSON.parse(raw) as IssueProjectItemsResponse).data?.repository
		?.issue;
	if (!issue?.id) throw new Error(`No issue ${label} could be read`);

	const items = (issue.projectItems?.nodes ?? [])
		.map(toIssueProjectItem)
		.filter((item): item is IssueProjectItem => item !== undefined);
	return { issueId: issue.id, items };
}
