import type { BacklogItem } from "./types";

function withCwd(url: string, cwd?: string): string {
	if (!cwd) return url;
	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}cwd=${encodeURIComponent(cwd)}`;
}

export async function fetchBacklogExists(cwd?: string): Promise<boolean> {
	const res = await fetch(withCwd("/api/backlog/exists", cwd));
	const data = (await res.json()) as { exists: boolean };
	return data.exists;
}

export async function initBacklog(cwd?: string): Promise<void> {
	await fetch(withCwd("/api/backlog/init", cwd), { method: "POST" });
}

export async function fetchItems(
	query?: string,
	cwd?: string,
): Promise<BacklogItem[]> {
	const base = query
		? `/api/items?q=${encodeURIComponent(query)}`
		: "/api/items";
	const res = await fetch(withCwd(base, cwd));
	return res.json();
}

export async function createItem(
	body: {
		type: "story" | "bug";
		name: string;
		description?: string;
		acceptanceCriteria: string[];
	},
	cwd?: string,
): Promise<BacklogItem> {
	const res = await fetch(withCwd("/api/items", cwd), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return res.json();
}

export async function deleteItem(id: number, cwd?: string): Promise<void> {
	await fetch(withCwd(`/api/items/${id}`, cwd), { method: "DELETE" });
}

export async function updateItem(
	id: number,
	body: {
		type: "story" | "bug";
		name: string;
		description?: string;
		acceptanceCriteria: string[];
	},
	cwd?: string,
): Promise<BacklogItem> {
	const res = await fetch(withCwd(`/api/items/${id}`, cwd), {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return res.json();
}

export async function updateItemStatus(
	id: number,
	status: BacklogItem["status"],
	cwd?: string,
): Promise<BacklogItem> {
	const res = await fetch(withCwd(`/api/items/${id}`, cwd), {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status }),
	});
	return res.json();
}

export async function rewindPhase(
	id: number,
	phase: number,
	reason: string,
	cwd?: string,
): Promise<BacklogItem> {
	const res = await fetch(withCwd(`/api/items/${id}/rewind`, cwd), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ phase, reason }),
	});
	return res.json();
}
