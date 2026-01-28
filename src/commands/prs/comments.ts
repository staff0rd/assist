import { execSync } from "node:child_process";
import chalk from "chalk";
import { isClaudeCode } from "../../lib/isClaudeCode";
import { getRepoInfo, isGhNotInstalled, isNotFound } from "./shared";
import type { PrComment } from "./types";

function formatForHuman(comment: PrComment): string {
	if (comment.type === "review") {
		const stateColor =
			comment.state === "APPROVED"
				? chalk.green
				: comment.state === "CHANGES_REQUESTED"
					? chalk.red
					: chalk.yellow;
		return [
			`${chalk.cyan("Review")} by ${chalk.bold(comment.user)} ${stateColor(`[${comment.state}]`)}`,
			comment.body,
			"",
		].join("\n");
	}
	const location = comment.line ? `:${comment.line}` : "";
	return [
		`${chalk.cyan("Line comment")} by ${chalk.bold(comment.user)} on ${chalk.dim(`${comment.path}${location}`)}`,
		chalk.dim(comment.diff_hunk.split("\n").slice(-3).join("\n")),
		comment.body,
		"",
	].join("\n");
}

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
}

export async function comments(prNumber: number): Promise<PrComment[]> {
	try {
		const { org, repo } = getRepoInfo();
		const allComments: PrComment[] = [];

		const reviewResult = execSync(
			`gh api repos/${org}/${repo}/pulls/${prNumber}/reviews`,
			{ encoding: "utf-8" },
		);

		if (reviewResult.trim()) {
			const reviews = JSON.parse(reviewResult);
			for (const review of reviews) {
				if (review.body) {
					allComments.push({
						type: "review",
						id: review.id,
						user: review.user.login,
						state: review.state,
						body: review.body,
					});
				}
			}
		}

		const lineResult = execSync(
			`gh api repos/${org}/${repo}/pulls/${prNumber}/comments`,
			{ encoding: "utf-8" },
		);

		if (lineResult.trim()) {
			const lineComments = JSON.parse(lineResult);
			for (const comment of lineComments) {
				allComments.push({
					type: "line",
					id: comment.id,
					user: comment.user.login,
					path: comment.path,
					line: comment.line,
					body: comment.body,
					diff_hunk: comment.diff_hunk,
				});
			}
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
