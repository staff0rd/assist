import { existsSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { landingFailed } from "./landingFailed";
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

/** Land a parallel phase's commits on the item branch: rebase, verify if the branch moved, then fast-forward it. */
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

	for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
		const target = phaseGit(["rev-parse", "HEAD"], tree).out;
		if (isAncestor("HEAD", target)) {
			console.log(chalk.green("Already landed on the item branch."));
			return;
		}
		if (!isAncestor(target, "HEAD")) {
			if (!rebaseOnto(target) || !verifyAfterRebase()) return;
		}
		const head = phaseGit(["rev-parse", "HEAD"]).out;
		if (phaseGit(["merge", "--ff-only", head], tree).ok) {
			console.log(
				chalk.green(`Landed ${head.slice(0, 8)} on the item branch.`),
			);
			return;
		}
	}
	landingFailed(
		`Could not fast-forward the item branch in ${tree}: it kept moving or has uncommitted changes. Run \`assist backlog land\` again.`,
	);
}
