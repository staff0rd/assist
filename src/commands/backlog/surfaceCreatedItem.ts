import { emitActivity } from "../../shared/emitActivity";
import { InvalidItemIdError, parseItemId } from "./formatItemId";
import { loadItem } from "./loadItem";
import { getReady } from "./shared";

export async function surfaceCreatedItem(
	slashCommand: string,
	id: string,
): Promise<void> {
	let numericId: number;
	try {
		numericId = parseItemId(id);
	} catch (error) {
		if (error instanceof InvalidItemIdError) return;
		throw error;
	}
	const { orm } = await getReady();
	const item = await loadItem(orm, numericId);
	if (!item) return;
	emitActivity({
		kind: "command",
		name: slashCommand,
		itemId: numericId,
		itemName: item.name,
	});
}
