import type { BacklogItem } from "./types";
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

export async function initBacklog(cwd?: string): Promise<void> {
	await fetch(withCwd("/api/backlog/init", cwd), { method: "POST" });
}

export async function deleteItem(id: number, cwd?: string): Promise<void> {
	await fetch(withCwd(`/api/items/${id}`, cwd), { method: "DELETE" });
}

export async function deleteComment(
	itemId: number,
	commentId: number,
	cwd?: string,
): Promise<void> {
	const res = await fetch(
		withCwd(`/api/items/${itemId}/comments/${commentId}`, cwd),
		{ method: "DELETE" },
	);
	if (!res.ok) {
		const body = (await res.json().catch(() => undefined)) as
			| { error?: string }
			| undefined;
		throw new Error(body?.error ?? `Failed to delete comment (${res.status})`);
	}
}

export function updateItemStatus(
	id: number,
	status: BacklogItem["status"],
	cwd?: string,
): Promise<BacklogItem> {
	return sendJson(withCwd(`/api/items/${id}`, cwd), "PATCH", { status });
}

export function toggleStar(
	id: number,
	starred: boolean,
	cwd?: string,
): Promise<BacklogItem> {
	return sendJson(withCwd(`/api/items/${id}/star`, cwd), "POST", { starred });
}

export function rewindPhase(
	id: number,
	phase: number,
	reason: string,
	cwd?: string,
): Promise<BacklogItem> {
	return sendJson(withCwd(`/api/items/${id}/rewind`, cwd), "POST", {
		phase,
		reason,
	});
}
