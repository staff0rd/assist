import { landingTarget } from "./landingTarget";
import { landTree } from "./landTree";
import { parallelPhaseNumber } from "./parallelPhaseNumber";
import { isAncestor, phaseGit } from "./phaseGit";

/** Why a parallel phase can't be marked done yet: its commits are not on the item branch. */
export function unlandedPhaseError(phaseNumber: number): string | undefined {
	const tree = landTree();
	if (!tree || parallelPhaseNumber() !== phaseNumber) return undefined;
	if (phaseGit(["status", "--porcelain"]).out)
		return "Phase not landed: commit your work, then run `assist backlog land` before phase-done.";
	const target = landingTarget(tree);
	const tip = target.tip();
	if (tip && isAncestor("HEAD", tip)) return undefined;
	return `Phase not landed on ${target.label}: run \`assist backlog land\`, then run phase-done again.`;
}
