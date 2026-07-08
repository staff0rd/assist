import type { ChildProcess } from "node:child_process";
import { existsSync, unwatchFile, watchFile } from "node:fs";
import { readSignal } from "./readSignal";
import { getSignalPath } from "./writeSignal";

export function watchForMarker(
	child: ChildProcess,
	options?: { actOnDone?: boolean },
): { killedOnMarker: () => boolean } {
	let killed = false;
	const statusPath = getSignalPath();
	if (!statusPath) return { killedOnMarker: () => killed };
	watchFile(statusPath, { interval: 1000 }, () => {
		if (!existsSync(statusPath)) return;
		const signal = readSignal();
		if (!signal) return;
		if (signal.event === "done" && !options?.actOnDone) return;
		unwatchFile(statusPath);
		killed = true;
		child.kill("SIGTERM");
	});
	return { killedOnMarker: () => killed };
}

export function stopWatching(): void {
	const statusPath = getSignalPath();
	if (statusPath) unwatchFile(statusPath);
}
