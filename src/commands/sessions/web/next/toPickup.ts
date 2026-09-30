import type { GhProjectItemNode, NextBoard, NextPickup } from "./types";

export function toPickup(
	node: GhProjectItemNode,
	board: NextBoard,
	order: number[],
): NextPickup | null {
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
		project: board.project,
		projectTitle: board.title,
		itemId: node.id,
		status,
		priority: node.priority?.name ?? null,
		type: issue.issueType?.name
			? { name: issue.issueType.name, color: issue.issueType.color ?? "GRAY" }
			: null,
		boardOrder: order,
	};
}
