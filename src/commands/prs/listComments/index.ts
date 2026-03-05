import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "yaml";
import { fetchThreadIds } from "../fetchThreadIds";
import { deleteCommentsCache } from "../loadCommentsCache";
import {
	getCurrentPrNumber,
	getRepoInfo,
	isGhNotInstalled,
	isNotFound,
} from "../shared";
import type { PrComment } from "../types";
import { fetchLineComments, fetchReviewComments } from "./fetchReviewComments";
import type { ListCommentsResult } from "./printComments";

export { printComments } from "./printComments";

function writeCommentsCache(prNumber: number, comments: PrComment[]): void {
	const assistDir = join(process.cwd(), ".assist");
	if (!existsSync(assistDir)) {
		mkdirSync(assistDir, { recursive: true });
	}

	const cacheData = {
		prNumber,
		fetchedAt: new Date().toISOString(),
		comments,
	};

	const cachePath = join(assistDir, `pr-${prNumber}-comments.yaml`);
	writeFileSync(cachePath, stringify(cacheData));
}

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

function updateCache(prNumber: number, comments: PrComment[]): void {
	if (comments.some((c) => c.type === "line")) {
		writeCommentsCache(prNumber, comments);
	} else {
		deleteCommentsCache(prNumber);
	}
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
		updateCache(prNumber, allComments);
		const hasLineComments = allComments.some((c) => c.type === "line");
		const cachePath = hasLineComments
			? join(process.cwd(), ".assist", `pr-${prNumber}-comments.yaml`)
			: null;
		return { comments: allComments, cachePath };
	} catch (error) {
		const handled = handleKnownErrors(error);
		if (handled !== null) return { comments: handled, cachePath: null };
		throw error;
	}
}
