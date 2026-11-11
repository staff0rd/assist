import type { IncomingMessage, ServerResponse } from "node:http";
import { getInstallDir } from "../../../../shared/getInstallDir";
import { respondJson } from "../../../../shared/web";
import { readUpdateHistory } from "./readUpdateHistory";

export function updateHistory(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	respondJson(res, 200, { history: readUpdateHistory(getInstallDir()) });
}
