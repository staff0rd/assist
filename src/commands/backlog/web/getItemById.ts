import type { ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { loadLinkTargets } from "../show/loadLinkTargets";
import type { BacklogItemDetail } from "../types";
import { itemConversations } from "./itemConversations";
import { withReviewPhase } from "./withReviewPhase";
import { findItemOr404 } from "./shared";

export async function getItemById(
	res: ServerResponse,
	id: number,
): Promise<void> {
	const result = await findItemOr404(res, id);
	if (!result) return;
	const item: BacklogItemDetail = withReviewPhase(result.item);
	const conversations = await itemConversations(item);
	if (conversations.length > 0) item.conversations = conversations;
	const docsRefreshFor = await loadLinkTargets(
		result.orm,
		(item.links ?? [])
			.filter((l) => l.type === "docs-refresh")
			.map((l) => l.targetId),
	);
	if (docsRefreshFor.length > 0) item.docsRefreshFor = docsRefreshFor;
	respondJson(res, 200, item);
}
