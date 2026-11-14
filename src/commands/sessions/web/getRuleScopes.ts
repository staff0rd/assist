import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { readRuleScopes } from "../../rules/readRuleScopes";
import { getCwdParam } from "./getCwdParam";

export async function getRuleScopes(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		respondJson(res, 200, { scopes: await readRuleScopes(cwd) });
	} catch (error) {
		respondJson(res, 500, {
			error: error instanceof Error ? error.message : "Failed to read rules",
		});
	}
}
