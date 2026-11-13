import { daemonLog } from "./daemonLog";
import { routed } from "./routed";

export const handleInterrupt = routed((_client, m, d) => {
	const id = String(d.sessionId);
	const session = m.session(id);
	const sdk = session?.pty?.sdk;
	if (!sdk) {
		daemonLog(
			`interrupt ignored: session ${id} ${session ? "is not a Claude (SDK) session" : "was not found"}`,
		);
		return;
	}
	daemonLog(`interrupt received: session ${id}`);
	sdk.interrupt();
});
