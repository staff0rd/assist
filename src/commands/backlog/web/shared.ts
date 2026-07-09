import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { deleteItem as deleteItemById } from "../deleteItem";
import { loadItem } from "../loadItem";
import { getReady } from "../shared";
import type { BacklogItem } from "../types";
import { updateStarred } from "../updateStarred";
import { updateStatus } from "../updateStatus";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { loadVisibleItems } from "./loadVisibleItems";
import { parseStarBody, parseStatusBody } from "./parseStatusBody";
import { withReviewPhase } from "./withReviewPhase";

export async function listItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	const items = await loadVisibleItems(req);
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
	if (result) respondJson(res, 200, withReviewPhase(result.item));
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

export async function patchItemStar(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const { starred } = await parseStarBody(req);
	const result = await findItemOr404(res, id);
	if (!result) return;
	await updateStarred(result.orm, id, starred);
	const updated: BacklogItem = { ...result.item, starred };
	respondJson(res, 200, updated);
}
