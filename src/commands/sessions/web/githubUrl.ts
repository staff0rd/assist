import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getPreferredRemoteRepo } from "../../prs/getPreferredRemoteRepo";
import { getCwdParam } from "./getCwdParam";

export function githubUrl(req: IncomingMessage, res: ServerResponse): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const repo = getPreferredRemoteRepo(cwd);
	respondJson(res, 200, {
		url: repo ? `https://github.com/${repo.org}/${repo.repo}` : null,
	});
}
