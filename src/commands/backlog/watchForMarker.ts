import type { ChildProcess } from "node:child_process";
import { existsSync, unwatchFile, watchFile } from "node:fs";
import { readSignal } from "./readSignal";
import { getSignalPath } from "./writeSignal";

export function watchForMarker(child: ChildProcess): void {
	const statusPath = getSignalPath();
	watchFile(statusPath, { interval: 1000 }, () => {
		if (!existsSync(statusPath)) return;
		const signal = readSignal();
		if (signal) {
			unwatchFile(statusPath);
			child.kill("SIGTERM");
		}
	});
}

export function stopWatching(): void {
	unwatchFile(getSignalPath());
}
