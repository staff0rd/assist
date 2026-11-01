import { daemonLog } from "./daemonLog";
import { routed } from "./routed";

export const handleDismiss = routed((_client, m, d) => {
	const closeServerRuns = d.closeServerRuns === true;
	daemonLog(
		`dismiss received: id=${d.sessionId} closeServerRuns=${closeServerRuns}`,
	);
	m.dismissSession(d.sessionId as string, closeServerRuns);
});
