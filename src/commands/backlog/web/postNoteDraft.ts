import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { respondJson } from "../../../shared/web";
import { requestAssistSession } from "../../sessions/shared/requestAssistSession";
import { getCwdParam } from "../../sessions/web/getCwdParam";
import { readJsonBody } from "../../sessions/web/readJsonBody";

const postNoteDraftSchema = z.object({ text: z.string().trim().min(1) });

export async function postNoteDraft(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const parsed = postNoteDraftSchema.safeParse(
		await readJsonBody(req).catch(() => undefined),
	);
	if (!parsed.success) {
		respondJson(res, 400, { error: "Body must be { text: string }" });
		return;
	}
	try {
		const sessionId = await requestAssistSession(
			["draft", "--once", parsed.data.text],
			cwd,
		);
		respondJson(res, 201, { sessionId });
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
