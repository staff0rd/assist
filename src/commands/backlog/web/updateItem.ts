import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { saveBacklog } from "../shared";
import { parseItemBody } from "./parseItemBody";
import { findItemOr404 } from "./shared";

export async function updateItem(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const body = await parseItemBody(req);
	const result = await findItemOr404(res, id);
	if (!result) return;
	Object.assign(result.item, {
		type: body.type ?? result.item.type,
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
	});
	await saveBacklog(result.items);
	respondJson(res, 200, result.item);
}
