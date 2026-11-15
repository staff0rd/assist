import { spawnSync } from "node:child_process";
import chalk from "chalk";
import { landingFailed } from "./landingFailed";

export function rebaseOnto(target: string): boolean {
	console.log(chalk.dim(`Rebasing onto the item branch (${target})...`));
	if (spawnSync("git", ["rebase", target], { stdio: "inherit" }).status === 0)
		return true;
	landingFailed(
		"Rebase stopped on conflicts. Resolve them, `git add` the files, run `git rebase --continue`, then run `assist backlog land` again.",
	);
	return false;
}
