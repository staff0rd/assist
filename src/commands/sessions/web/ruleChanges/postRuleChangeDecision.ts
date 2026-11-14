import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { decideRuleChange } from "./decideRuleChange";
import { readJsonObject } from "./readJsonObject";

export async function postRuleChangeDecision(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await readJsonObject(req);
	const { id, decision } = body ?? {};
	if (
		typeof id !== "string" ||
		(decision !== "approve" && decision !== "reject")
	)
		return respondJson(res, 400, {
			error: 'Expected { id, decision: "approve" | "reject" }',
		});
	const result = await decideRuleChange(id, decision);
	if (!result.ok) return respondJson(res, 409, { error: result.error });
	respondJson(res, 200, result);
}
