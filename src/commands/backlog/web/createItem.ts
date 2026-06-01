import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getBacklogDb } from "../getBacklogDb";
import { insertItem } from "../insertItem";
import { getOrigin } from "../shared";
import { parseItemBody } from "./parseItemBody";

export async function createItem(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await parseItemBody(req);
	const db = await getBacklogDb();
	const newItem = {
		type: body.type ?? ("story" as const),
		name: body.name,
		description: body.description,
		acceptanceCriteria: body.acceptanceCriteria ?? [],
		status: "todo" as const,
	};
	const id = await insertItem(db, newItem, getOrigin());
	respondJson(res, 201, { id, ...newItem });
}
