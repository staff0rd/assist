import { sendTo } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { resetState, type WindowsProxyState } from "./WindowsProxyState";

// The connection to the Windows daemon dropped: answer anyone still awaiting a
// create, clear proxied state, and drop the Windows cards from every UI by
// rebroadcasting the merged session list.
export function handleWindowsClose(state: WindowsProxyState): void {
	daemonLog("windows proxy: connection to windows daemon closed");
	for (const client of state.pendingCreators)
		sendTo(client, {
			type: "error",
			message: "Windows daemon connection closed",
		});
	resetState(state);
	state.onSessionsChanged();
}
