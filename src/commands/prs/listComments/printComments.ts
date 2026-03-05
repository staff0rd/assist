import chalk from "chalk";
import { isClaudeCode } from "../../../lib/isClaudeCode";
import type { PrComment } from "../types";

export type ListCommentsResult = {
	comments: PrComment[];
	cachePath: string | null;
};

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

function summarise(comments: PrComment[]): string {
	const lineCount = comments.filter((c) => c.type === "line").length;
	const reviewCount = comments.filter((c) => c.type === "review").length;
	const parts: string[] = [];
	if (lineCount > 0) parts.push(`${lineCount} line`);
	if (reviewCount > 0) parts.push(`${reviewCount} review`);
	return `Found ${parts.join(" and ")} comment${comments.length === 1 ? "" : "s"}.`;
}

export function printComments(result: ListCommentsResult): void {
	const { comments, cachePath } = result;
	if (comments.length === 0) {
		console.log("No comments found.");
		return;
	}
	if (!isClaudeCode()) {
		for (const comment of comments) {
			console.log(formatForHuman(comment));
		}
	}
	console.log(summarise(comments));
	if (cachePath) {
		console.log(`Saved to ${cachePath}`);
	}
}
