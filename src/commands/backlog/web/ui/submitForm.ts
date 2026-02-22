import { createItem, updateItem } from "./api";
import type { BacklogItem } from "./types";

export async function submitForm(
	type: "story" | "bug",
	name: string,
	description: string,
	criteria: string[],
	item?: BacklogItem,
): Promise<number | undefined> {
	const trimmed = name.trim();
	if (!trimmed) return undefined;
	const body = {
		type,
		name: trimmed,
		description: description.trim() || undefined,
		acceptanceCriteria: criteria.map((c) => c.trim()).filter(Boolean),
	};
	if (item) {
		await updateItem(item.id, body);
		return item.id;
	}
	const created = await createItem(body);
	return created.id;
}
