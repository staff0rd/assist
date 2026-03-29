import type { ChildProcess } from "node:child_process";
import { existsSync, unwatchFile, watchFile } from "node:fs";
import { getPhaseStatusPath } from "./phaseDone";

export function watchForMarker(child: ChildProcess): void {
	const statusPath = getPhaseStatusPath();
	watchFile(statusPath, { interval: 1000 }, () => {
		if (existsSync(statusPath)) {
			unwatchFile(statusPath);
			child.kill("SIGTERM");
		}
	});
}

export function stopWatching(): void {
	unwatchFile(getPhaseStatusPath());
}
