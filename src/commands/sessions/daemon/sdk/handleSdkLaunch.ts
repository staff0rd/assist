import { daemonLog } from "../daemonLog";
import type { Handler } from "../routed";
import { phaseLaunchHold } from "../transfer/runPhaseBoundaryTransfer";
import { launchSdkPhase } from "./launchSdkPhase";

export const handleSdkLaunch: Handler = (client, m, d) => {
	m.clients.delete(client);
	const hold = phaseLaunchHold(String(d.sessionId));
	if (!hold) return launchSdkPhase(client, m, d);
	daemonLog(
		`session ${String(d.sessionId)} sdk-launch held: transfer in progress`,
	);
	void hold.then(() => launchSdkPhase(client, m, d));
};
