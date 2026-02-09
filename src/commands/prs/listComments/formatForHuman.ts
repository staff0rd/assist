import chalk from "chalk";
import type { PrComment } from "../types";

export function formatForHuman(comment: PrComment): string {
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
