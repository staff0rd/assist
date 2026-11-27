import { appendDaemonLog } from "../daemon/appendDaemonLog";
import { sendToDaemon } from "../daemon/sendToDaemon";
import { failWith } from "../previews/failWith";
import { inWebSession } from "../shared/inWebSession";

export async function sendToCurrentSession(
	verb: string,
	build: (sessionId: string) => Record<string, unknown>,
): Promise<void> {
	if (!inWebSession()) {
		console.log(`No daemon-managed session to ${verb}.`);
		return;
	}
	const sessionId = process.env.ASSIST_SESSION_ID as string;
	try {
		await sendToDaemon(build(sessionId));
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		appendDaemonLog(`${verb} send failed: id=${sessionId}: ${reason}`);
		failWith(new Error(`Failed to ${verb} session ${sessionId}: ${reason}`));
	}
}
