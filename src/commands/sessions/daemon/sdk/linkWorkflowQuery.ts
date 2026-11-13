import type { SessionProcess } from "../../../../shared/harnessAdapters/types";
import { type SessionClient, sendTo } from "../broadcast";
import { daemonLog } from "../daemonLog";

export function linkWorkflowQuery(
	client: SessionClient,
	sessionId: string,
	query: SessionProcess,
): void {
	let ended = false;
	query.onExit(({ exitCode }) => {
		ended = true;
		daemonLog(
			`session ${sessionId} sdk workflow query ended: exit ${exitCode}`,
		);
		sendTo(client, { type: "sdk-exit", sessionId, exitCode });
	});
	client.onClose?.(() => {
		if (ended) return;
		daemonLog(
			`session ${sessionId} sdk workflow launcher disconnected: ending its query`,
		);
		query.kill();
	});
}
