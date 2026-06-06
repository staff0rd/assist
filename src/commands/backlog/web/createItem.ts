import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getBacklogOrm } from "../getBacklogOrm";
import { insertItem } from "../insertItem";
import { getOrigin } from "../shared";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { parseItemBody } from "./parseItemBody";

export async function createItem(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await parseItemBody(req);
	applyCwdFromReq(req);
	const orm = await getBacklogOrm();
	const newItem = {
		type: body.type ?? ("story" as const),
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
		status: "todo" as const,
	};
	const id = await insertItem(orm, newItem, getOrigin());
	respondJson(res, 201, { id, ...newItem });
}
