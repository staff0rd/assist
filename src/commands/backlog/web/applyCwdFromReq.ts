import type { IncomingMessage } from "node:http";
import { setBacklogDir } from "../shared";

export function applyCwdFromReq(req: IncomingMessage): void {
	const url = new URL(req.url ?? "/", "http://localhost");
	const cwd = url.searchParams.get("cwd");
	console.log(
		"[backlog server] applyCwdFromReq:",
		req.method,
		url.pathname,
		"cwd=",
		cwd,
	);
	setBacklogDir(cwd ?? undefined);
}
