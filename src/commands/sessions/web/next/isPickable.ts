import type { GhProjectItemNode, PickupFilter } from "./types";

const lowered = (values: string[]) =>
	new Set(values.map((value) => value.toLowerCase()));

export function isPickable(filter: PickupFilter) {
	const statuses = lowered(filter.pickStatuses);
	const excludedLabels = lowered(filter.excludeLabels);
	const excludedTypes = lowered(filter.excludeTypes);
	return (node: GhProjectItemNode): boolean => {
		const issue = node.content;
		if (issue?.state !== "OPEN" || issue.assignees?.totalCount !== 0)
			return false;
		if (!statuses.has(node.status?.name?.toLowerCase() ?? "")) return false;
		const type = issue.issueType?.name?.toLowerCase();
		if (type && excludedTypes.has(type)) return false;
		return !(issue.labels?.nodes ?? []).some(
			(label) => label?.name && excludedLabels.has(label.name.toLowerCase()),
		);
	};
}
