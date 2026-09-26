import { formatItemId } from "../../formatItemId";
import type { BacklogItem, SubtaskStatus } from "./types";
import { withCwd } from "./withCwd";

async function sendJson<T>(
	url: string,
	method: string,
	body: unknown,
): Promise<T> {
	const res = await fetch(url, {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return res.json();
}

export async function deleteItem(
	id: number,
	cwd?: string,
	node?: string,
): Promise<void> {
	await fetch(withCwd(`/api/items/${formatItemId(id)}`, cwd, node), {
		method: "DELETE",
	});
}

export function updateItemStatus(
	id: number,
	status: BacklogItem["status"],
	cwd?: string,
	node?: string,
): Promise<BacklogItem> {
	return sendJson(
		withCwd(`/api/items/${formatItemId(id)}`, cwd, node),
		"PATCH",
		{ status },
	);
}

export function updateSubtaskStatus(
	itemId: number,
	idx: number,
	status: SubtaskStatus,
	cwd?: string,
	node?: string,
): Promise<BacklogItem> {
	return sendJson(
		withCwd(`/api/items/${formatItemId(itemId)}/subtasks/${idx}`, cwd, node),
		"PATCH",
		{ status },
	);
}

export function toggleStar(
	id: number,
	starred: boolean,
	cwd?: string,
	node?: string,
): Promise<BacklogItem> {
	return sendJson(
		withCwd(`/api/items/${formatItemId(id)}/star`, cwd, node),
		"POST",
		{ starred },
	);
}

export function rewindPhase(
	id: number,
	phase: number,
	reason: string,
	cwd?: string,
	node?: string,
): Promise<BacklogItem> {
	return sendJson(
		withCwd(`/api/items/${formatItemId(id)}/rewind`, cwd, node),
		"POST",
		{
			phase,
			reason,
		},
	);
}
