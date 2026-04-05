import type { BacklogItem } from "./types";

export async function fetchItems(query?: string): Promise<BacklogItem[]> {
	const url = query
		? `/api/items?q=${encodeURIComponent(query)}`
		: "/api/items";
	const res = await fetch(url);
	return res.json();
}

export async function createItem(body: {
	type: "story" | "bug";
	name: string;
	description?: string;
	acceptanceCriteria: string[];
}): Promise<BacklogItem> {
	const res = await fetch("/api/items", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return res.json();
}

export async function deleteItem(id: number): Promise<void> {
	await fetch(`/api/items/${id}`, { method: "DELETE" });
}

export async function updateItem(
	id: number,
	body: {
		type: "story" | "bug";
		name: string;
		description?: string;
		acceptanceCriteria: string[];
	},
): Promise<BacklogItem> {
	const res = await fetch(`/api/items/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	return res.json();
}

export async function updateItemStatus(
	id: number,
	status: BacklogItem["status"],
): Promise<BacklogItem> {
	const res = await fetch(`/api/items/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ status }),
	});
	return res.json();
}
