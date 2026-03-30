import chalk from "chalk";
import type { BacklogComment } from "./types";

export function formatComment(entry: BacklogComment): string {
	const tag =
		entry.type === "summary"
			? chalk.magenta("[summary]")
			: chalk.cyan("[comment]");
	const phase =
		entry.phase !== undefined ? chalk.dim(` (phase ${entry.phase + 1})`) : "";
	const time = chalk.dim(entry.timestamp);
	return `${tag}${phase} ${time}\n  ${entry.text}`;
}
