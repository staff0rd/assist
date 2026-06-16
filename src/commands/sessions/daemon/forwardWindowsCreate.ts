import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import type { WindowsConnection } from "./WindowsConnection";
import type { WindowsProxyState } from "./WindowsProxyState";

type Msg = Record<string, unknown>;

// Forwards a windows-origin create/resume to the Windows daemon, tracing each
// step so a stuck session can be pinned to launch, connect, or the daemon itself.
export async function forwardWindowsCreate(
	conn: WindowsConnection,
	state: WindowsProxyState,
	client: SessionClient,
	data: Msg,
): Promise<void> {
	daemonLog(`windows proxy: routing ${data.type} (cwd=${data.cwd})`);
	try {
		await conn.ensure();
		daemonLog("windows proxy: connection ready, forwarding create");
		state.pendingCreators.push(client);
		conn.write(data);
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		daemonLog(`windows proxy: forwardCreate failed: ${message}`);
		sendTo(client, {
			type: "error",
			message: `Windows session unavailable: ${message}`,
		});
	}
}
