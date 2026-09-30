import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { fetchAssignedIssues } from "./fetchAssignedIssues";
import { fetchPeerPrs } from "./fetchPeerPrs";
import { nextScope } from "./nextScope";
import { scopeRepos } from "./scopeRepos";
import { sectionAcross } from "./sectionAcross";
import type { NextResponse } from "./types";

export async function nextItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const scope = nextScope(cwd);
	const [peerPrs, assignedIssues] = await Promise.all([
		sectionAcross(
			scopeRepos(scope.prRepos, scope.selfRepo),
			(repo) => fetchPeerPrs(cwd, repo, scope.peers),
			(a, b) => a.requestedAt.localeCompare(b.requestedAt),
			"next.prRepos",
		),
		sectionAcross(
			scopeRepos(scope.issueRepos, scope.selfRepo),
			(repo) => fetchAssignedIssues(cwd, repo),
			(a, b) => a.createdAt.localeCompare(b.createdAt),
			"next.issueRepos",
		),
	]);
	const body: NextResponse = { scope, peerPrs, assignedIssues };
	respondJson(res, 200, body);
}
