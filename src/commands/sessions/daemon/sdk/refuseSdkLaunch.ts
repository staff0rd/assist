import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";

export function refuseSdkLaunch(
	client: SessionClient,
	sessionId: string,
	reason: string,
): void {
	daemonLog(`sdk-launch refused: session ${sessionId} ${reason}`);
	sendTo(client, {
		type: "sdk-exit",
		sessionId,
		exitCode: 1,
		error: `Claude (SDK) launch refused: session ${sessionId} ${reason}`,
	});
}
