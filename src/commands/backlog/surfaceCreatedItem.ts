import { emitActivity } from "../../shared/emitActivity";
import { loadItem } from "./loadItem";
import { getReady } from "./shared";

export async function surfaceCreatedItem(
	slashCommand: string,
	id: string,
): Promise<void> {
	const numericId = Number.parseInt(id, 10);
	if (Number.isNaN(numericId)) return;
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
