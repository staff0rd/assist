import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { respondJson } from "../../../../shared/web";
import { saveHighLevelProgress } from "../../../review/highLevel/progressStore/saveHighLevelProgress";
import { parseJsonBody } from "../parseJsonBody";
import { highLevelProgressHeadSchema } from "./highLevelProgressHeadSchema";

const side = z.enum(["LEFT", "RIGHT"]).optional();

const bodySchema = highLevelProgressHeadSchema.extend({
	requestId: z.string().min(1).optional(),
	items: z.array(
		z.object({
			id: z.string(),
			ticked: z.boolean().optional(),
			comment: z.string().optional(),
			slice: z.number().int().optional(),
		}),
	),
	reviewComments: z.array(
		z.object({
			path: z.string(),
			startLine: z.number().int(),
			endLine: z.number().int(),
			quote: z.string(),
			note: z.string(),
			startSide: side,
			side,
			headSha: z.string().optional(),
		}),
	),
});

export async function postHighLevelProgress(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await parseJsonBody(req, bodySchema);
	if (!body) {
		respondJson(res, 400, { error: "Invalid high-level progress" });
		return;
	}
	const { repo, prNumber, headSha, requestId, ...progress } = body;
	if (
		saveHighLevelProgress(
			{ repo, prNumber, headSha, ...(requestId ? { requestId } : {}) },
			progress,
		)
	)
		respondJson(res, 200, { ok: true });
	else respondJson(res, 409, { error: "This review already has a verdict" });
}
