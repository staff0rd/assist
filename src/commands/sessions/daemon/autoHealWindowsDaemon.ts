import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { WindowsConnection } from "./WindowsConnection";
import type { WindowsProxyState } from "./WindowsProxyState";

// why: on a version drift, updating + relaunching the host daemon makes the
// reconnect handshake match the freshly-installed version
export async function autoHealWindowsDaemon(
	conn: WindowsConnection,
	state: WindowsProxyState,
	heal: () => Promise<void>,
	version: string,
): Promise<void> {
	daemonLog(`windows proxy: auto-healing windows daemon (mismatch ${version})`);
	notifyHealing(state);
	try {
		conn.dispose();
		await heal();
		daemonLog("windows proxy: heal complete, reconnecting to windows daemon");
		await conn.ensure();
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		daemonLog(`windows proxy: auto-heal failed: ${message}`);
		state.broadcast({
			type: "error",
			message: `Windows host auto-update failed: ${message}`,
		});
	}
}

// why: the in-flight create can't complete against the stale daemon being torn
// down, so tell the requester to reselect once the update finishes
function notifyHealing(state: WindowsProxyState): void {
	for (const client of state.pendingCreators)
		sendTo(client, {
			type: "error",
			message:
				"Windows host is out of date; updating it now — reselect the repo once the update finishes.",
		});
	state.pendingCreators = [];
}
