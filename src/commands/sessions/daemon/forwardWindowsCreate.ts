import { type SessionClient, sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { stripWindowsSessionId } from "./toWindowsSessionId";
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
		conn.write(stripOutboundSessionId(data));
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		daemonLog(`windows proxy: forwardCreate failed: ${message}`);
		sendTo(client, {
			type: "error",
			message: `Windows session unavailable: ${message}`,
		});
	}
}

/* why: the UI addresses windows sessions by their namespaced id (w-3), but the
 * windows daemon only knows its own native id. A resume forwarded with the w-
 * prefix intact targets a transcript that doesn't exist (leaking a fresh
 * session) and the daemon then re-reports an id we namespace again into w-w-3,
 * w-w-w-3, ... — so strip the prefix before forwarding, as the I/O path does. */
function stripOutboundSessionId(data: Msg): Msg {
	if (typeof data.sessionId !== "string") return data;
	return { ...data, sessionId: stripWindowsSessionId(data.sessionId) };
}
