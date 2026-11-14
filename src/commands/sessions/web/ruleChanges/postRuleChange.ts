import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { parseRuleChange } from "./parseRuleChange";
import { proposeRuleChange } from "./proposeRuleChange";
import { readJsonObject } from "./readJsonObject";

export async function postRuleChange(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const body = await readJsonObject(req);
	const change = parseRuleChange(body?.change);
	if (typeof body?.cwd !== "string" || !body.cwd || !change)
		return respondJson(res, 400, { error: "Expected { cwd, change }" });
	const result = await proposeRuleChange(change, body.cwd);
	if (!result.ok) return respondJson(res, 409, { error: result.error });
	respondJson(res, 200, { change: result.pending });
}
