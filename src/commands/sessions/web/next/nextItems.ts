import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { fetchAssignedIssues } from "./fetchAssignedIssues";
import { fetchOpenPrs } from "./fetchOpenPrs";
import { fetchPickups } from "./fetchPickups";
import { nextScope } from "./nextScope";
import { scopeRepos } from "./scopeRepos";
import { sectionAcross } from "./sectionAcross";
import type { NextPr, NextResponse, OpenPrs } from "./types";

const byRequestedAt = (a: NextPr, b: NextPr) =>
	a.requestedAt.localeCompare(b.requestedAt);

export async function nextItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const scope = nextScope(cwd);
	const repos = scopeRepos(scope.repos, scope.selfRepo);
	const openPrs = new Map(
		repos.map((repo): [string, Promise<OpenPrs>] => [
			repo,
			fetchOpenPrs(cwd, repo, scope.peers),
		]),
	);
	const openPrsOf = (repo: string) => openPrs.get(repo) as Promise<OpenPrs>;
	const [peerPrs, myPrs, assignedIssues, { pickups, boards }] =
		await Promise.all([
			sectionAcross(
				repos,
				(repo) => openPrsOf(repo).then((prs) => prs.peerPrs),
				byRequestedAt,
			),
			sectionAcross(
				repos,
				(repo) => openPrsOf(repo).then((prs) => prs.myPrs),
				byRequestedAt,
			),
			sectionAcross(
				repos,
				(repo) => fetchAssignedIssues(cwd, repo),
				(a, b) => a.createdAt.localeCompare(b.createdAt),
			),
			fetchPickups(cwd, scope.projects, scope),
		]);
	const body: NextResponse = {
		scope,
		peerPrs,
		myPrs,
		assignedIssues,
		pickups,
		boards,
	};
	respondJson(res, 200, body);
}
