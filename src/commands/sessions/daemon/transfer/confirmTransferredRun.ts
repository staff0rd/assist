import type { Session } from "../createSession";
import { daemonLog } from "../daemonLog";
import { awaitRunEstablished } from "./awaitRunEstablished";

export async function confirmTransferredRun(
	sessions: Map<string, Session>,
	id: string,
	trace: string,
): Promise<void> {
	const established = await awaitRunEstablished(sessions, id);
	if (!established.ok) {
		daemonLog(
			`session ${id} transfer run failed to start ${trace}: ${established.error}; reporting transfer failed so the source is kept`,
		);
		throw new Error(`run failed to start on target: ${established.error}`);
	}
	daemonLog(
		`session ${id} transfer run established ${trace}: ${established.reason}`,
	);
}
