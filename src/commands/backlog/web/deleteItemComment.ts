import type { ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { deleteComment } from "../deleteComment";
import { formatItemId } from "../formatItemId";
import { loadItem } from "../loadItem";
import { findItemOr404 } from "./shared";

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
			error: `Comment #${commentId} not found on item ${formatItemId(itemId)}.`,
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
