import type { IncomingMessage, ServerResponse } from "node:http";
import { eq } from "drizzle-orm";
import { respondJson } from "../../../shared/web";
import { items } from "../backlogSchema";
import { loadItem } from "../loadItem";
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
	const { orm } = result;
	await orm
		.update(items)
		.set({
			type: body.type ?? result.item.type,
			name: body.name,
			description: body.description ?? null,
			acceptanceCriteria: JSON.stringify(body.acceptanceCriteria ?? []),
		})
		.where(eq(items.id, id));
	respondJson(res, 200, await loadItem(orm, id));
}
