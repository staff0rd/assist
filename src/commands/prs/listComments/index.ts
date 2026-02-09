import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { stringify } from "yaml";
import { isClaudeCode } from "../../../lib/isClaudeCode";
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
import { formatForHuman } from "./formatForHuman";

export function printComments(comments: PrComment[]): void {
	if (comments.length === 0) {
		console.log("No comments found.");
		return;
	}
	if (isClaudeCode()) {
		for (const comment of comments) {
			console.log(JSON.stringify(comment));
		}
	} else {
		for (const comment of comments) {
			console.log(formatForHuman(comment));
		}
	}
	const lineComments = comments.filter((c) => c.type === "line");
	if (lineComments.length === 0) {
		console.log("No line comments to process.");
	}
}

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

export async function listComments(): Promise<PrComment[]> {
	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		const threadInfo = fetchThreadIds(org, repo, prNumber);
		const allComments = [
			...fetchReviewComments(org, repo, prNumber),
			...fetchLineComments(org, repo, prNumber, threadInfo),
		];

		if (allComments.some((c) => c.type === "line")) {
			writeCommentsCache(prNumber, allComments);
		} else {
			deleteCommentsCache(prNumber);
		}

		return allComments;
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			return [];
		}
		if (isNotFound(error)) {
			console.error("Error: Pull request not found.");
			return [];
		}
		throw error;
	}
}
