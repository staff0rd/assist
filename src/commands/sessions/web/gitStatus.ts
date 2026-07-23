import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { execGit } from "./execGit";
import { getCwdParam } from "./getCwdParam";
import { parseGitStatus } from "./parseGitStatus";

export async function gitStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const output = await execGit(cwd, [
			"status",
			"--porcelain",
			"--untracked-files=all",
		]);
		respondJson(res, 200, parseGitStatus(output));
	} catch {
		respondJson(res, 200, { new: [], modified: [], deleted: [] });
	}
}
