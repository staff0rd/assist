import type { BacklogItem } from "./types";

export async function fetchItems(): Promise<BacklogItem[]> {
	const res = await fetch("/api/items");
	return res.json();
}

export async function createItem(body: {
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
