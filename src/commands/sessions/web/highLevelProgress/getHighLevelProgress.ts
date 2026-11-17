import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { loadHighLevelProgress } from "../../../review/highLevel/progressStore/loadHighLevelProgress";
import { highLevelProgressHeadSchema } from "./highLevelProgressHeadSchema";

export function getHighLevelProgress(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const head = highLevelProgressHeadSchema.safeParse(
		Object.fromEntries(params),
	);
	if (!head.success) {
		respondJson(res, 400, { error: "Invalid repo, prNumber or headSha" });
		return;
	}
	const { repo, prNumber, headSha } = head.data;
	respondJson(res, 200, {
		progress: loadHighLevelProgress(repo, prNumber, headSha) ?? null,
	});
}
