import { emitActivity } from "../../shared/emitActivity";
import { InvalidItemIdError, parseItemId } from "./formatItemId";
import { loadItem } from "./loadItem";
import { getReady } from "./shared";

function parseValidIds(ids: string[]): number[] {
	const parsed: number[] = [];
	for (const id of ids) {
		try {
			parsed.push(parseItemId(id));
		} catch (error) {
			if (!(error instanceof InvalidItemIdError)) throw error;
		}
	}
	return [...new Set(parsed)];
}

export async function surfaceCreatedItems(
	slashCommand: string,
	ids: string[],
): Promise<void> {
	const numericIds = parseValidIds(ids);
	if (numericIds.length === 0) return;
	const { orm } = await getReady();
	const items = [];
	for (const id of numericIds) {
		const item = await loadItem(orm, id);
		if (item) items.push(item);
	}
	const [first] = items;
	if (!first) return;
	emitActivity({
		kind: "command",
		name: slashCommand,
		itemId: first.id,
		itemName: first.name,
		...(items.length > 1 && { itemIds: items.map((item) => item.id) }),
	});
}
