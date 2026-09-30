import { comparePickups } from "./comparePickups";
import { isPickable } from "./isPickable";
import type { GhProjectItemNode, NextPickup, PickupFilter } from "./types";

export type PickupBoard = {
	project: string;
	title: string;
	priorityOrder: string[];
};

function priorityRank(priority: string | null, order: string[]): number {
	const index = priority ? order.indexOf(priority) : -1;
	return index === -1 ? order.length : index;
}

function toPickup(
	node: GhProjectItemNode,
	board: PickupBoard,
): NextPickup | null {
	const issue = node.content;
	const repo = issue?.repository?.nameWithOwner;
	const status = node.status?.name;
	if (!issue?.number || !issue.url || !repo || !status) return null;
	const priority = node.priority?.name ?? null;
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
		priority,
		priorityRank: priorityRank(priority, board.priorityOrder),
	};
}

export function selectPickups(
	nodes: GhProjectItemNode[],
	filter: PickupFilter,
	board: PickupBoard,
): NextPickup[] {
	return nodes
		.filter(isPickable(filter))
		.flatMap((node) => toPickup(node, board) ?? [])
		.sort(comparePickups);
}
