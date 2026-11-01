import { describeOccupants } from "./describeOccupants";
import { liveProcessesInTree } from "./liveProcessesInTree";
import { readOccupant } from "./readOccupant";
import { stopInstall } from "./stopInstall";

export function liveOccupantReason(treePath: string): string | undefined {
	stopInstall(treePath);
	return describeOccupants(
		liveProcessesInTree(treePath).map((pid) => readOccupant(pid)),
	);
}
