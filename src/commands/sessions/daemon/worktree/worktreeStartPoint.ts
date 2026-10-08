import { gitSyncOrNull } from "./git";
import { cloneHead } from "./cloneHead";
import { remoteDefaultBranch } from "./remoteDefaultBranch";

type StartPoint = { ref: string; track: boolean };

export function worktreeStartPoint(clone: string, trunk: boolean): StartPoint {
	const branch = trunk ? cloneTrunkBranch(clone) : remoteDefaultBranch(clone);
	const ref = `origin/${branch}`;
	if (gitSyncOrNull(clone, ["rev-parse", "--verify", "--quiet", ref]))
		return { ref, track: trunk };
	return { ref: "HEAD", track: false };
}

function cloneTrunkBranch(clone: string): string {
	return cloneHead(clone) ?? remoteDefaultBranch(clone);
}
