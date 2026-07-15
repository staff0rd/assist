import { isWindowsDaemonRunning } from "./connectToWindowsDaemon";
import { daemonLog } from "./daemonLog";
import { hasPersistedWindowsSessions } from "./hasPersistedWindowsSessions";
import type { WindowsConnection } from "./WindowsConnection";

export async function discoverWindowsSessions(
	conn: WindowsConnection,
): Promise<void> {
	if (conn.connected) return;
	if (await isWindowsDaemonRunning()) {
		daemonLog("windows proxy: discovering sessions on running windows daemon");
	} else if (hasPersistedWindowsSessions()) {
		daemonLog(
			"windows proxy: launching windows daemon to restore persisted sessions",
		);
	} else {
		return;
	}
	try {
		await conn.ensure();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		daemonLog(`windows proxy: discovery failed: ${message}`);
	}
}
