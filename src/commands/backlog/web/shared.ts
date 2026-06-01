import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { loadBacklog, saveBacklog, searchBacklog } from "../shared";
import { parseStatusBody } from "./parseItemBody";

export async function listItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const q = url.searchParams.get("q");
	respondJson(res, 200, q ? await searchBacklog(q) : await loadBacklog());
}

export async function findItemOr404(res: ServerResponse, id: number) {
	const items = await loadBacklog();
	const item = items.find((i) => i.id === id);
	if (!item) {
		respondJson(res, 404, { error: "Not found" });
		return undefined;
	}
	return { items, item };
}

export async function getItemById(
	res: ServerResponse,
	id: number,
): Promise<void> {
	const result = await findItemOr404(res, id);
	if (result) respondJson(res, 200, result.item);
}

export async function deleteItem(
	res: ServerResponse,
	id: number,
): Promise<void> {
	const result = await findItemOr404(res, id);
	if (!result) return;
	await saveBacklog(result.items.filter((i) => i.id !== id));
	respondJson(res, 200, result.item);
}

export async function patchItemStatus(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const { status } = await parseStatusBody(req);
	const result = await findItemOr404(res, id);
	if (!result) return;
	result.item.status = status;
	await saveBacklog(result.items);
	respondJson(res, 200, result.item);
}
