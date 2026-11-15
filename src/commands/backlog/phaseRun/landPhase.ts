import { existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { landingFailed } from "./landingFailed";
import { landingTarget } from "./landingTarget";
import { landTree } from "./landTree";
import { isAncestor, phaseGit } from "./phaseGit";
import { rebaseOnto } from "./rebaseOnto";
import { verifyAfterRebase } from "./verifyAfterRebase";

const MAX_ATTEMPTS = 3;

function rebaseInProgress(): boolean {
	const gitDir = phaseGit(["rev-parse", "--absolute-git-dir"]).out;
	return (
		existsSync(join(gitDir, "rebase-merge")) ||
		existsSync(join(gitDir, "rebase-apply"))
	);
}

/** Land a parallel phase's commits: rebase onto the branch it lands on, verify if that moved, then push (or fast-forward) it. */
export function landPhase(): void {
	const tree = landTree();
	if (!tree)
		return landingFailed(
			"Not a parallel phase session: its work is already on the item branch.",
		);
	if (rebaseInProgress())
		return landingFailed(
			"A rebase is in progress. Resolve it with `git rebase --continue`, then run `assist backlog land` again.",
		);
	if (phaseGit(["status", "--porcelain"]).out)
		return landingFailed("Commit your work before landing it.");

	const target = landingTarget(tree);
	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const tip = target.tip();
		if (isAncestor("HEAD", tip)) {
			console.log(chalk.green(`Already landed on ${target.label}.`));
			return;
		}
		if (!isAncestor(tip, "HEAD")) {
			if (!rebaseOnto(tip) || !verifyAfterRebase()) return;
		}
		const head = phaseGit(["rev-parse", "HEAD"]).out;
		if (target.publish(head)) {
			console.log(
				chalk.green(`Landed ${head.slice(0, 8)} on ${target.label}.`),
			);
			return;
		}
	}
	landingFailed(
		`Could not land on ${target.label}: it kept moving or was rejected. Run \`assist backlog land\` again.`,
	);
}
