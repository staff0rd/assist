import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getPreferredRemoteRepo } from "../../prs/getPreferredRemoteRepo";
import { getCwdParam } from "./getCwdParam";
import { windowsCwdToWslPath } from "./windowsCwdToWslPath";

export function githubUrl(req: IncomingMessage, res: ServerResponse): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	// why: a windows-origin repo (C:\…) is read via the /mnt mount — resolving the remote is a cheap config read, unlike git-status which we never run here
	const repo = getPreferredRemoteRepo(windowsCwdToWslPath(cwd));
	respondJson(res, 200, {
		url: repo ? `https://github.com/${repo.org}/${repo.repo}` : null,
	});
}
