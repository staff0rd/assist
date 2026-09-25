import { commentsCachePath } from "./commentsCachePath";
import { fetchThreadIds } from "./fetchThreadIds";
import {
	getCurrentPrNumber,
	getRepoInfo,
	isGhNotInstalled,
	isNotFound,
} from "./shared";
import type { PrComment } from "./types";
import {
	fetchLineComments,
	fetchReviewComments,
} from "./listComments/fetchReviewComments";
import type { ListCommentsResult } from "./listComments/printComments";
import { updateCommentsCache } from "./listComments/updateCommentsCache";

function handleKnownErrors(error: unknown): PrComment[] | null {
	if (isGhNotInstalled(error)) {
		console.error("Error: GitHub CLI (gh) is not installed.");
		console.error("Install it from https://cli.github.com/");
		return [];
	}
	if (isNotFound(error)) {
		console.error("Error: Pull request not found.");
		return [];
	}
	return null;
}

export async function listComments(): Promise<ListCommentsResult> {
	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		const threadInfo = fetchThreadIds(org, repo, prNumber);
		const allComments = [
			...fetchReviewComments(org, repo, prNumber),
			...fetchLineComments(org, repo, prNumber, threadInfo),
		];
		updateCommentsCache(org, repo, prNumber, allComments);
		const hasLineComments = allComments.some((c) => c.type === "line");
		const cachePath = hasLineComments
			? commentsCachePath(org, repo, prNumber)
			: null;
		return { comments: allComments, cachePath };
	} catch (error) {
		const handled = handleKnownErrors(error);
		if (handled !== null) return { comments: handled, cachePath: null };
		throw error;
	}
}
