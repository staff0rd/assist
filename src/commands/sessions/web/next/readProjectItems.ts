import { readProjectPage } from "./readProjectPage";
import type { PickupBoard } from "./selectPickups";
import type { GhProjectItemNode } from "./types";

const MAX_PAGES = 10;

export async function readProjectItems(cwd: string, project: string) {
	const [owner, number] = project.split("/");
	const nodes: GhProjectItemNode[] = [];
	const board: PickupBoard = { project, title: project, priorityOrder: [] };
	let after: string | null = null;
	for (let page = 0; page < MAX_PAGES; page++) {
		const response = await readProjectPage(cwd, owner, number, after);
		const projectV2 = response.data?.repositoryOwner?.projectV2;
		if (!projectV2?.items) {
			const reason = response.errors?.[0]?.message;
			throw new Error(reason ?? `No project ${number} owned by ${owner}`);
		}
		board.title = projectV2.title ?? project;
		board.priorityOrder = (projectV2.priorityField?.options ?? []).map(
			(option) => option.name,
		);
		for (const node of projectV2.items.nodes ?? []) if (node) nodes.push(node);
		const { hasNextPage, endCursor } = projectV2.items.pageInfo ?? {};
		if (!hasNextPage || !endCursor) break;
		after = endCursor;
	}
	return { nodes, board };
}
