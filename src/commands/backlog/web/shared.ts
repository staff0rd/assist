import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { deleteItem as deleteItemById } from "../deleteItem";
import { loadItem } from "../loadItem";
import { getReady, loadBacklog, searchBacklog } from "../shared";
import type { BacklogItem } from "../types";
import { updateStatus } from "../updateStatus";
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
	const { orm } = await getReady();
	const item = await loadItem(orm, id);
	if (!item) {
		respondJson(res, 404, { error: "Not found" });
		return undefined;
	}
	return { orm, item };
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
	await deleteItemById(result.orm, id);
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
	await updateStatus(result.orm, id, status);
	const updated: BacklogItem = { ...result.item, status };
	respondJson(res, 200, updated);
}
