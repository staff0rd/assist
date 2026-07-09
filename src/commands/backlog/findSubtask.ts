import type { Db } from "../../shared/db/Db";
import { resolveSubtaskIndex } from "./resolveSubtaskIndex";
import { findOneItem } from "./shared";
import type { BacklogItem } from "./types";

export async function findSubtask(
	id: string,
	index: string,
): Promise<{ orm: Db; item: BacklogItem; idx: number } | undefined> {
	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return undefined;
	}
	const idx = resolveSubtaskIndex(id, index, found.item);
	if (idx === undefined) return undefined;
	return { orm: found.orm, item: found.item, idx };
}
