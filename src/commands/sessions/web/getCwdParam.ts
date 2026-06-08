import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";

export function getCwdParam(
	req: IncomingMessage,
	res: ServerResponse,
): string | null {
	const url = new URL(req.url ?? "/", "http://localhost");
	const cwd = url.searchParams.get("cwd");
	if (!cwd) {
		respondJson(res, 400, { error: "Missing cwd" });
		return null;
	}
	return cwd;
}
