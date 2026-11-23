import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { autopilotRepos } from "./autopilotRepos";

export function listAutopilotRepos(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	respondJson(res, 200, { repos: autopilotRepos() });
}
