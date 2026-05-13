import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { saveBacklog } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { findItemOr404 } from "./findItemOr404";
import { parseItemBody } from "./parseItemBody";

export async function updateItem(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const body = await parseItemBody(req);
	applyCwdFromReq(req);
	const result = findItemOr404(res, id);
	if (!result) return;
	Object.assign(result.item, {
		type: body.type ?? result.item.type,
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
	});
	saveBacklog(result.items);
	respondJson(res, 200, result.item);
}
