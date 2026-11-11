import type { IncomingMessage, ServerResponse } from "node:http";
import { relative, sep } from "node:path";
import { respondJson } from "../../../../shared/web";
import { execGit } from "../execGit";
import { getConversationParam } from "../getConversationParam";
import { resolveDiffScope } from "../resolveDiffScope";

export const MAX_FILE_BYTES = 2 * 1024 * 1024;

type BlobEntry = { hash: string; size: number };

async function commitBlob(
	cwd: string,
	sha: string,
	path: string,
): Promise<BlobEntry | undefined> {
	const line = await execGit(cwd, ["ls-tree", "-l", sha, "--", path]);
	const match = /^\d+ blob ([0-9a-f]+)\s+(\d+)\t/.exec(line);
	if (!match) return undefined;
	return { hash: match[1], size: Number(match[2]) };
}

export async function respondCommitFile(
	req: IncomingMessage,
	res: ServerResponse,
	{ cwd, target }: { cwd: string; target: string },
	commit: string,
): Promise<void> {
	try {
		const scope = await resolveDiffScope(
			cwd,
			getConversationParam(req),
			commit,
		);
		if (scope?.kind !== "commit") {
			respondJson(res, 400, { error: "Invalid commit" });
			return;
		}
		const path = relative(cwd, target).split(sep).join("/");
		const blob = await commitBlob(cwd, scope.sha, path);
		if (!blob) {
			respondJson(res, 404, { error: "File not found" });
			return;
		}
		if (blob.size > MAX_FILE_BYTES) {
			respondJson(res, 413, { error: "File too large" });
			return;
		}
		const content = await execGit(cwd, ["cat-file", "blob", blob.hash], {
			maxBuffer: MAX_FILE_BYTES + 1,
		});
		respondJson(res, 200, { content, mtimeMs: 0 });
	} catch {
		respondJson(res, 404, { error: "File not found" });
	}
}
