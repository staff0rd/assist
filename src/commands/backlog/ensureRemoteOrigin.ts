import chalk from "chalk";
import { getRemoteOriginUrl } from "./getCurrentOrigin";
import { getBacklogDir } from "./shared";

export function ensureRemoteOrigin(): boolean {
	if (getRemoteOriginUrl(getBacklogDir())) return true;
	console.log(
		chalk.red(
			"Backlog requires a git remote so items get a stable origin.\n" +
				"Add one with: git remote add origin <url>",
		),
	);
	process.exitCode = 1;
	return false;
}
