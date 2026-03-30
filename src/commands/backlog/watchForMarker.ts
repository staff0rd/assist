import type { ChildProcess } from "node:child_process";
import { existsSync, unwatchFile, watchFile } from "node:fs";
import { readSignal } from "./readSignal";
import { getSignalPath } from "./writeSignal";

export function watchForMarker(child: ChildProcess): void {
	const statusPath = getSignalPath();
	const sessionId = process.env.ASSIST_SESSION_ID;
	watchFile(statusPath, { interval: 1000 }, () => {
		if (!existsSync(statusPath)) return;
		const signal = readSignal();
		if (signal && (!signal.sessionId || signal.sessionId === sessionId)) {
			unwatchFile(statusPath);
			child.kill("SIGTERM");
		}
	});
}

export function stopWatching(): void {
	unwatchFile(getSignalPath());
}
