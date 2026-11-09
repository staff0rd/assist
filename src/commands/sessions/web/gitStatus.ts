import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { getConversationParam } from "./getConversationParam";
import { type GitBranchInfo, gitBranchInfo } from "./gitBranchInfo";
import { groupedCounts } from "./groupedCounts";
import { itemChangeSet } from "./itemChangeSet";
import type { GitStatusCounts } from "./parseGitStatus";
import { workingTreeCounts } from "./workingTreeCounts";

export type ItemStatusCounts = GitStatusCounts &
	Partial<GitBranchInfo> & {
		uncommitted?: GitStatusCounts;
		hasCommits?: boolean;
	};

export async function gitStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const branch = await gitBranchInfo(cwd);
		const changeSet = await itemChangeSet(cwd, getConversationParam(req)).catch(
			() => undefined,
		);
		if (!changeSet) {
			respondJson(res, 200, { ...(await workingTreeCounts(cwd)), ...branch });
			return;
		}
		const [counts, uncommitted] = await Promise.all([
			groupedCounts(cwd, changeSet.groups),
			workingTreeCounts(cwd),
		]);
		respondJson(res, 200, {
			...counts,
			...branch,
			uncommitted,
			hasCommits: changeSet.commits.length > 0,
		});
	} catch {
		respondJson(res, 200, { new: [], modified: [], deleted: [] });
	}
}
