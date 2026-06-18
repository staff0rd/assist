import { unlinkSync, writeFileSync } from "node:fs";
import { daemonLog } from "./daemonLog";
import { daemonPaths } from "./daemonPaths";
import type { SessionManager } from "./SessionManager";
import { ownsPidFile, startPidFileWatchdog } from "./startPidFileWatchdog";

export function onListening(
	manager: SessionManager,
	checkAutoExit: (idle: boolean) => void,
): void {
	writeFileSync(daemonPaths.pid, String(process.pid));
	startPidFileWatchdog(() => {
		daemonLog("lost daemon.pid ownership; shutting down sessions and exiting");
		manager.shutdown();
		process.exit(0);
	});
	process.on("exit", cleanupOwnedFiles);
	const restored = manager.restore();
	const liveIds = new Set(manager.listSessions().map((s) => s.id));
	manager.active.restore((id) => liveIds.has(id));
	daemonLog(
		restored.length > 0
			? `restored ${restored.length} session(s): ${restored.join(", ")}`
			: "no persisted sessions to restore",
	);
	daemonLog(`listening on ${daemonPaths.socket}`);
	checkAutoExit(manager.isIdle());
}

function cleanupOwnedFiles(): void {
	if (!ownsPidFile()) return;
	try {
		unlinkSync(daemonPaths.pid);
	} catch {}
	if (process.platform !== "win32") {
		try {
			unlinkSync(daemonPaths.socket);
		} catch {}
	}
}
