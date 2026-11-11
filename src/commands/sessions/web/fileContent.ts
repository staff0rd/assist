import { readFile, stat } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import {
	MAX_FILE_BYTES,
	respondCommitFile,
} from "./fileContent/respondCommitFile";
import { getFileTarget } from "./getFileTarget";

export async function fileContent(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const resolved = getFileTarget(req, res);
	if (!resolved) return;
	const commit = new URL(req.url ?? "/", "http://localhost").searchParams.get(
		"commit",
	);
	if (commit) {
		await respondCommitFile(req, res, resolved, commit);
		return;
	}
	try {
		const info = await stat(resolved.target);
		if (!info.isFile()) {
			respondJson(res, 404, { error: "File not found" });
			return;
		}
		if (info.size > MAX_FILE_BYTES) {
			respondJson(res, 413, { error: "File too large" });
			return;
		}
		respondJson(res, 200, {
			content: await readFile(resolved.target, "utf8"),
			mtimeMs: info.mtimeMs,
		});
	} catch {
		respondJson(res, 404, { error: "File not found" });
	}
}
