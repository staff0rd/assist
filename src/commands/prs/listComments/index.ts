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

function formatComment(comment: PrComment): string {
	return isClaudeCode() ? JSON.stringify(comment) : formatForHuman(comment);
}

export function printComments(comments: PrComment[]): void {
	if (comments.length === 0) {
		console.log("No comments found.");
		return;
	}
	for (const comment of comments) {
		console.log(formatComment(comment));
	}
	if (!comments.some((c) => c.type === "line")) {
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

export async function listComments(): Promise<PrComment[]> {
	try {
		const prNumber = getCurrentPrNumber();
		const { org, repo } = getRepoInfo();
		const threadInfo = fetchThreadIds(org, repo, prNumber);
		const allComments = [
			...fetchReviewComments(org, repo, prNumber),
			...fetchLineComments(org, repo, prNumber, threadInfo),
		];
		updateCache(prNumber, allComments);
		return allComments;
	} catch (error) {
		const handled = handleKnownErrors(error);
		if (handled !== null) return handled;
		throw error;
	}
}
