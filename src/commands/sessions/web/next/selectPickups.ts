import { isPickable } from "./isPickable";
import type {
	GhProjectItemNode,
	NextBoard,
	NextPickup,
	PickupFilter,
} from "./types";

function toPickup(
	node: GhProjectItemNode,
	board: NextBoard,
	position: number,
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
		position,
	};
}

export function selectPickups(
	nodes: GhProjectItemNode[],
	filter: PickupFilter,
	board: NextBoard,
): NextPickup[] {
	const pickable = isPickable(filter);
	return nodes.flatMap((node, position) =>
		pickable(node) ? (toPickup(node, board, position) ?? []) : [],
	);
}
