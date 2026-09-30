import type { GhProjectItemNode, NextPickup } from "./types";

function toPickup(node: GhProjectItemNode): NextPickup | null {
	const issue = node.content;
	const repo = issue?.repository?.nameWithOwner;
	const status = node.status?.name;
	if (!issue?.number || !issue.url || !repo || !status) return null;
	return {
		repo,
		number: issue.number,
		title: issue.title ?? "",
		url: issue.url,
		createdAt: issue.createdAt ?? "",
		author: issue.author?.login ?? "unknown",
		labels: (issue.labels?.nodes ?? []).flatMap((label) =>
			label?.name ? [label.name] : [],
		),
		itemId: node.id,
		status,
		priority: node.priority?.name ?? null,
	};
}

export function selectPickups(
	nodes: GhProjectItemNode[],
	pickStatuses: string[],
	priorityOrder: string[],
): NextPickup[] {
	const statuses = new Set(pickStatuses.map((status) => status.toLowerCase()));
	const rank = (pickup: NextPickup) => {
		const index = pickup.priority ? priorityOrder.indexOf(pickup.priority) : -1;
		return index === -1 ? priorityOrder.length : index;
	};
	return nodes
		.filter(
			(node) =>
				node.content?.state === "OPEN" &&
				node.content.assignees?.totalCount === 0,
		)
		.flatMap((node) => toPickup(node) ?? [])
		.filter((pickup) => statuses.has(pickup.status.toLowerCase()))
		.sort(
			(a, b) => rank(a) - rank(b) || a.createdAt.localeCompare(b.createdAt),
		);
}
