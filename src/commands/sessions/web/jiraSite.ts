import type { IncomingMessage, ServerResponse } from "node:http";
import { loadJson } from "../../../shared/loadJson";
import { respondJson } from "../../../shared/web";

export function jiraSite(_req: IncomingMessage, res: ServerResponse): void {
	const config = loadJson<{ site?: string }>("jira.json");
	respondJson(res, 200, { site: config.site ?? null });
}
