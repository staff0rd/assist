import type { ChildProcess } from "node:child_process";
import { existsSync, unwatchFile, watchFile } from "node:fs";
import { readSignal } from "./readSignal";
import { getSignalPath } from "./writeSignal";

export function watchForMarker(
	child: ChildProcess,
	options?: { actOnDone?: boolean },
): void {
	const statusPath = getSignalPath();
	if (!statusPath) return;
	watchFile(statusPath, { interval: 1000 }, () => {
		if (!existsSync(statusPath)) return;
		const signal = readSignal();
		if (!signal) return;
		if (signal.event === "done" && !options?.actOnDone) return;
		unwatchFile(statusPath);
		child.kill("SIGTERM");
	});
}

export function stopWatching(): void {
	const statusPath = getSignalPath();
	if (statusPath) unwatchFile(statusPath);
}
