import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { deleteComment } from "../deleteComment";
import { deleteItem as deleteItemById } from "../deleteItem";
import { loadItem } from "../loadItem";
import { getReady, loadBacklog, searchBacklog } from "../shared";
import type { BacklogItem } from "../types";
import { updateStatus } from "../updateStatus";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { parseStatusBody } from "./parseItemBody";

export async function listItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	const q = new URL(req.url ?? "/", "http://localhost").searchParams.get("q");
	const items = q ? await searchBacklog(q) : await loadBacklog();
	// The web view lists newest-first, reversing the ascending-id CLI ordering.
	respondJson(res, 200, items.slice().reverse());
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

export async function deleteItemComment(
	res: ServerResponse,
	itemId: number,
	commentId: number,
): Promise<void> {
	const result = await findItemOr404(res, itemId);
	if (!result) return;
	const outcome = await deleteComment(result.orm, itemId, commentId);
	if (outcome === "not-found") {
		respondJson(res, 404, {
			error: `Comment #${commentId} not found on item #${itemId}.`,
		});
		return;
	}
	if (outcome === "is-summary") {
		respondJson(res, 400, {
			error: `Comment #${commentId} is a phase summary and cannot be deleted.`,
		});
		return;
	}
	respondJson(res, 200, await loadItem(result.orm, itemId));
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
