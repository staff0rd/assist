import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";

export function refuseSdkLaunch(
	client: SessionClient,
	sessionId: string,
	label: string,
	reason: string,
): void {
	daemonLog(`sdk-launch refused: session ${sessionId} ${reason}`);
	sendTo(client, {
		type: "sdk-exit",
		sessionId,
		exitCode: 1,
		error: `${label} launch refused: session ${sessionId} ${reason}`,
	});
}
