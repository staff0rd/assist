export type IssueProjectItem = {
	itemId: string;
	projectId: string;
	projectNumber: number;
	projectTitle: string;
	statusField?: {
		id: string;
		options: { id: string; name: string }[];
	};
};

export type ProjectItemNode = {
	id?: string;
	project?: {
		id?: string;
		number?: number;
		title?: string;
		field?: { id?: string; options?: { id: string; name: string }[] } | null;
	} | null;
};

export function toIssueProjectItem(
	node: ProjectItemNode | null,
): IssueProjectItem | undefined {
	const project = node?.project;
	if (!node?.id || !project?.id) return undefined;
	return {
		itemId: node.id,
		projectId: project.id,
		projectNumber: project.number ?? 0,
		projectTitle: project.title ?? String(project.number ?? ""),
		statusField: project.field?.id
			? { id: project.field.id, options: project.field.options ?? [] }
			: undefined,
	};
}
