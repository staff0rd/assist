import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { respondJson } from "../../../shared/web";
import { readJsonBody } from "../../sessions/web/readJsonBody";
import { createItemWithDefaults } from "../createItemWithDefaults";
import { formatItemId } from "../formatItemId";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { noteItemName } from "./noteItemName";

const postItemSchema = z.object({ text: z.string().trim().min(1) });

export async function postItem(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	applyCwdFromReq(req);
	const parsed = postItemSchema.safeParse(
		await readJsonBody(req).catch(() => undefined),
	);
	if (!parsed.success) {
		respondJson(res, 400, { error: "Body must be { text: string }" });
		return;
	}
	const { text } = parsed.data;
	const name = noteItemName(text);
	const id = await createItemWithDefaults({
		type: "story",
		name,
		description: text,
		acceptanceCriteria: [],
	});
	respondJson(res, 201, { id: formatItemId(id), name });
}
