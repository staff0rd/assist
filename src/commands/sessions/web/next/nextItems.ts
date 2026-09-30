import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { fetchAssignedIssues } from "./fetchAssignedIssues";
import { fetchPeerPrs } from "./fetchPeerPrs";
import { fetchPickups } from "./fetchPickups";
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
	const repos = scopeRepos(scope.repos, scope.selfRepo);
	const [peerPrs, assignedIssues, pickups] = await Promise.all([
		sectionAcross(
			repos,
			(repo) => fetchPeerPrs(cwd, repo, scope.peers),
			(a, b) => a.requestedAt.localeCompare(b.requestedAt),
		),
		sectionAcross(
			repos,
			(repo) => fetchAssignedIssues(cwd, repo),
			(a, b) => a.createdAt.localeCompare(b.createdAt),
		),
		fetchPickups(cwd, scope.project, scope.pickStatuses),
	]);
	const body: NextResponse = { scope, peerPrs, assignedIssues, pickups };
	respondJson(res, 200, body);
}
