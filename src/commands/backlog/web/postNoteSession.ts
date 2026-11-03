import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { respondJson } from "../../../shared/web";
import { launchPlannedSession } from "../../sessions/web/fromGithub/launchPlannedSession";
import { getCwdParam } from "../../sessions/web/getCwdParam";
import { readJsonBody } from "../../sessions/web/readJsonBody";

const postNoteSessionSchema = z.object({
	text: z.string().trim().min(1),
	mode: z.enum(["draft", "bug", "prompt"]),
});

export async function postNoteSession(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const parsed = postNoteSessionSchema.safeParse(
		await readJsonBody(req).catch(() => undefined),
	);
	if (!parsed.success) {
		respondJson(res, 400, {
			error: 'Body must be { text: string, mode: "draft" | "bug" | "prompt" }',
		});
		return;
	}
	const { text, mode } = parsed.data;
	try {
		const sessionId = await launchPlannedSession({
			cwd,
			prompt: text,
			mode: mode === "prompt" ? undefined : mode,
		});
		respondJson(res, 201, { sessionId });
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : String(error),
		});
	}
}
