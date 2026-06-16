import { isWindowsDaemonRunning } from "./connectToWindowsDaemon";
import { daemonLog } from "./daemonLog";
import type { WindowsConnection } from "./WindowsConnection";

// Connects to an already-running Windows daemon so its live sessions appear
// immediately on web server open — without launching one that isn't running.
export async function discoverWindowsSessions(
	conn: WindowsConnection,
): Promise<void> {
	if (conn.connected || !(await isWindowsDaemonRunning())) return;
	daemonLog("windows proxy: discovering sessions on running windows daemon");
	try {
		await conn.ensure();
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		daemonLog(`windows proxy: discovery failed: ${message}`);
	}
}
