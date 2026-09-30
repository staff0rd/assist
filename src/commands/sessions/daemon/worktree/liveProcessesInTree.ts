import { readdirSync, readlinkSync } from "node:fs";
import { sep } from "node:path";

export function liveProcessesInTree(
	treePath: string,
	procRoot = "/proc",
): number[] {
	let entries: string[];
	try {
		entries = readdirSync(procRoot);
	} catch {
		return [];
	}
	const pids: number[] = [];
	for (const entry of entries) {
		const pid = Number(entry);
		if (!Number.isInteger(pid) || pid === process.pid) continue;
		const cwd = processCwd(`${procRoot}/${entry}/cwd`);
		if (cwd && (cwd === treePath || cwd.startsWith(treePath + sep)))
			pids.push(pid);
	}
	return pids;
}

function processCwd(link: string): string | undefined {
	try {
		return readlinkSync(link);
	} catch {
		return undefined;
	}
}
