import { daemonLog } from "./daemonLog";

export function logWindowsForward(
	delivered: boolean,
	type: unknown,
	sessionId: unknown,
): void {
	if (!delivered)
		daemonLog(
			`windows proxy: DROPPED ${type} for ${sessionId} (windows connection not writable)`,
		);
	else if (type !== "input")
		daemonLog(`windows proxy: forwarded ${type} for ${sessionId}`);
}
