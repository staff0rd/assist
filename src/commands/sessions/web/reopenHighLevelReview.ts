import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { respondJson } from "../../../shared/web";
import { requestDaemonReply } from "../daemon/requestDaemonReply";
import { readJsonBody } from "./readJsonBody";

const bodySchema = z.object({
	sessionId: z.string().min(1),
	prNumber: z.number().int().positive(),
});

type Reply = { ok: boolean; error?: string };

/* why: the reply waits for the review to gather the PR and open its pane,
 * which takes a checkout and several gh calls. */
const REOPEN_TIMEOUT_MS = 180_000;

export async function reopenHighLevelReview(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const parsed = bodySchema.safeParse(
		await readJsonBody(req).catch(() => undefined),
	);
	if (!parsed.success) {
		respondJson(res, 400, { error: "Invalid reopen request" });
		return;
	}
	const reply = await requestDaemonReply<Reply>(
		{ type: "reopen-high-level-review", ...parsed.data },
		"reopen-high-level-review-result",
		REOPEN_TIMEOUT_MS,
	);
	if (!reply) respondJson(res, 504, { error: "assist daemon did not answer" });
	else if (reply.ok) respondJson(res, 200, { ok: true });
	else respondJson(res, 409, { error: reply.error ?? "Reopen failed" });
}
