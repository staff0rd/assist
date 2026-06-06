import type { IncomingMessage } from "node:http";
import { setBacklogDir } from "../shared";

/**
 * Point the backlog at the repo named by the request's `cwd` query param, or
 * back at the server's own cwd when absent. Handlers call this before touching
 * the backlog so each request operates on its own repo's origin.
 */
export function applyCwdFromReq(req: IncomingMessage): void {
	const url = new URL(req.url ?? "/", "http://localhost");
	setBacklogDir(url.searchParams.get("cwd") ?? undefined);
}
