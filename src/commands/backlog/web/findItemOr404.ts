import type { ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { loadBacklog } from "../shared";
import type { BacklogFile, BacklogItem } from "../types";

export function findItemOr404(
	res: ServerResponse,
	id: number,
): { items: BacklogFile; item: BacklogItem } | undefined {
	const items = loadBacklog();
	const item = items.find((i) => i.id === id);
	if (!item) {
		respondJson(res, 404, { error: "Not found" });
		return undefined;
	}
	return { items, item };
}
