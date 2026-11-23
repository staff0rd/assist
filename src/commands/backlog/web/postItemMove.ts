import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { respondJson } from "../../../shared/web";
import { reorderItem } from "../reorderItem";
import { getReady } from "../shared";
import { parseJsonBody } from "../../sessions/web/parseJsonBody";

const placementSchema = z.union([
	z.object({ edge: z.enum(["top", "bottom"]) }),
	z.object({
		side: z.enum(["before", "after"]),
		targetId: z.number().int(),
	}),
]);

export async function postItemMove(
	req: IncomingMessage,
	res: ServerResponse,
	id: number,
): Promise<void> {
	const placement = await parseJsonBody(req, placementSchema);
	if (!placement) {
		respondJson(res, 400, { error: "Invalid placement" });
		return;
	}
	const { orm } = await getReady();
	const error = await reorderItem(orm, id, placement);
	if (error) {
		respondJson(res, 400, { error });
		return;
	}
	respondJson(res, 200, { ok: true });
}
