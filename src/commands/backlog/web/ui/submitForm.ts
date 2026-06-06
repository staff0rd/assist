import { createItem, updateItem } from "./api";
import type { BacklogItem } from "./types";

export type ItemFields = {
	type: "story" | "bug";
	name: string;
	description: string;
	criteria: string[];
};

export async function submitForm(
	fields: ItemFields,
	item?: BacklogItem,
	cwd?: string,
): Promise<number | undefined> {
	const trimmed = fields.name.trim();
	if (!trimmed) return undefined;
	const body = {
		type: fields.type,
		name: trimmed,
		description: fields.description.trim() || undefined,
		acceptanceCriteria: fields.criteria.map((c) => c.trim()).filter(Boolean),
	};
	if (item) {
		await updateItem(item.id, body, cwd);
		return item.id;
	}
	const created = await createItem(body, cwd);
	return created.id;
}
