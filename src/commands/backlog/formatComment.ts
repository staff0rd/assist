import chalk from "chalk";
import type { BacklogComment } from "./types";

export function formatComment(entry: BacklogComment): string {
	const id = entry.id !== undefined ? chalk.dim(`#${entry.id} `) : "";
	const tag =
		entry.type === "comment"
			? chalk.cyan("[comment]")
			: chalk.magenta(`[${entry.type}]`);
	const phase =
		entry.phase !== undefined ? chalk.dim(` (phase ${entry.phase})`) : "";
	const time = chalk.dim(entry.timestamp);
	return `${id}${tag}${phase} ${time}\n  ${entry.text}`;
}
