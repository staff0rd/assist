import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { getSessionParam } from "./getSessionParam";
import { resolveDiffScope } from "./resolveDiffScope";
import { scopedDiff } from "./scopedDiff";

function getScopeParam(req: IncomingMessage): string | undefined {
	const url = new URL(req.url ?? "/", "http://localhost");
	return url.searchParams.get("scope") ?? undefined;
}

export async function diff(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const session = getSessionParam(req);
	try {
		const scope = await resolveDiffScope(cwd, session, getScopeParam(req));
		if (!scope) {
			respondJson(res, 400, { error: "Invalid scope" });
			return;
		}
		const body = await scopedDiff(cwd, session, scope);
		res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		res.end(body);
	} catch (error) {
		const cause = error instanceof Error ? error.message : String(error);
		console.error(`GET /api/diff failed for cwd=${cwd}: ${cause}`);
		res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("");
	}
}
