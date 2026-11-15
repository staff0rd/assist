import { landTree } from "./landTree";
import { parallelPhaseNumber } from "./parallelPhaseNumber";
import { isAncestor, phaseGit } from "./phaseGit";

/** Why a parallel phase can't be marked done yet: its commits are not on the item branch. */
export function unlandedPhaseError(phaseNumber: number): string | undefined {
	const tree = landTree();
	if (!tree || parallelPhaseNumber() !== phaseNumber) return undefined;
	if (phaseGit(["status", "--porcelain"]).out)
		return "Phase not landed: commit your work, then run `assist backlog land` before phase-done.";
	const target = phaseGit(["rev-parse", "HEAD"], tree).out;
	if (target && isAncestor("HEAD", target)) return undefined;
	return "Phase not landed: run `assist backlog land` to rebase onto the item branch, verify and fast-forward it, then run phase-done again.";
}
