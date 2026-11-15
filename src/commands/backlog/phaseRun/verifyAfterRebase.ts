import { spawnSync } from "node:child_process";
import chalk from "chalk";
import { landingFailed } from "./landingFailed";

export function verifyAfterRebase(): boolean {
	console.log(chalk.dim("The item branch moved; running assist verify..."));
	if (spawnSync("assist", ["verify"], { stdio: "inherit" }).status === 0)
		return true;
	landingFailed(
		"assist verify failed after rebasing onto the item branch. Fix it, commit, then run `assist backlog land` again.",
	);
	return false;
}
