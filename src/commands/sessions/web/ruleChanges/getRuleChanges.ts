import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { listRuleChanges } from "./listRuleChanges";

export function getRuleChanges(
	req: IncomingMessage,
	res: ServerResponse,
): void {
	const cwd = getCwdParam(req, res);
	if (cwd) respondJson(res, 200, { changes: listRuleChanges(cwd) });
}
