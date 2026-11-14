import { daemonLog } from "../daemonLog";
import { routed } from "../routed";
import { stopShellCommand } from "./stopShellCommand";

export const handleSdkShellStop = routed((_client, m, d) => {
	const id = String(d.sessionId);
	const shellId = String(d.shellId);
	const session = m.session(id);
	if (!session || !stopShellCommand(session, shellId)) {
		daemonLog(
			`sdk-shell-stop ignored: session ${id} shell ${shellId} ${session ? "is not running" : "session was not found"}`,
		);
		return;
	}
	m.update(() => true);
});
