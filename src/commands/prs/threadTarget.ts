import { execFileSync } from "node:child_process";
import { azureDevopsRemote } from "../review/azureDevopsRemote";
import { azureDevopsCacheRepo } from "./azureDevops/azureDevopsCacheRepo";
import { azureDevopsThreadActions } from "./azureDevops/azureDevopsThreadActions";
import type { AzureDevopsThreadStatus } from "./azureDevops/azureDevopsThreadRequests";
import { replyToComment } from "./replyToComment";
import { getBaseRepoInfo } from "./getBaseRepoInfo";
import { getCurrentPrNumber } from "./shared";
import type { LineComment } from "./types";

export type ThreadTarget = {
	org: string;
	repo: string;
	prNumber: number;
	reply: (comment: LineComment, message: string) => void;
	resolve: (comment: LineComment) => void;
};

function resolveThread(threadId: string): void {
	const mutation = `mutation($threadId: ID!) { resolveReviewThread(input: {threadId: $threadId}) { thread { isResolved } } }`;
	execFileSync(
		"gh",
		["api", "graphql", "-f", `query=${mutation}`, "-f", `threadId=${threadId}`],
		{ stdio: ["inherit", "pipe", "inherit"] },
	);
}

function githubTarget(): ThreadTarget {
	const prNumber = getCurrentPrNumber();
	const { org, repo } = getBaseRepoInfo();
	return {
		org,
		repo,
		prNumber,
		reply: (comment, message) =>
			replyToComment(org, repo, prNumber, comment.id, message),
		resolve: (comment) => resolveThread(comment.threadId),
	};
}

export function threadTarget(status: AzureDevopsThreadStatus): ThreadTarget {
	const azure = azureDevopsRemote(process.cwd());
	if (!azure) return githubTarget();
	const pr = azureDevopsThreadActions.currentPr(azure);
	const threadId = (comment: LineComment) => Number(comment.threadId);
	return {
		...azureDevopsCacheRepo(pr),
		prNumber: pr.prId,
		reply: (comment, message) =>
			azureDevopsThreadActions.reply(pr, threadId(comment), message),
		resolve: (comment) =>
			azureDevopsThreadActions.setStatus(pr, threadId(comment), status),
	};
}
