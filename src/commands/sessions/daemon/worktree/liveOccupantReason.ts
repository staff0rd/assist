import { liveProcessesInTree } from "./liveProcessesInTree";
import { stopInstall } from "./stopInstall";

export function liveOccupantReason(treePath: string): string | undefined {
	stopInstall(treePath);
	const pids = liveProcessesInTree(treePath);
	if (pids.length === 0) return undefined;
	return `a live process is still running in it (pid ${pids.join(", ")})`;
}
