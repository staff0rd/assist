import { existsSync } from "node:fs";
import chalk from "chalk";
import { getHandoverPath } from "../handover/getHandoverPath";

export function blockedByHandover(cwd: string = process.cwd()): boolean {
	if (!existsSync(getHandoverPath(cwd))) return false;
	console.log(
		chalk.yellow(
			"HANDOVER.md present — resolve the pending handover before running backlog items.",
		),
	);
	console.log(
		chalk.dim(
			"Start a fresh session to load it, or run `assist handover archive` to set it aside.",
		),
	);
	return true;
}
