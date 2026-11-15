import { daemonLog } from "../daemonLog";
import { routed } from "../routed";
import { discardShellResult } from "./discardShellResult";

export const handleSdkShellDiscard = routed((_client, m, d) => {
	const id = String(d.sessionId);
	const shellId = String(d.shellId);
	const session = m.session(id);
	if (!session || !discardShellResult(session, shellId)) {
		daemonLog(
			`sdk-shell-discard ignored: session ${id} shell ${shellId} ${session ? "is not held" : "session was not found"}`,
		);
		return;
	}
	m.update(() => true);
});
