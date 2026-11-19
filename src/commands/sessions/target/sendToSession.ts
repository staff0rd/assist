import { sendToDaemon } from "../daemon/sendToDaemon";
import { failWith } from "../previews/failWith";
import { findDaemonSession } from "../previews/findDaemonSession";

export async function sendToSession(
	id: string,
	build: (sessionId: string) => Record<string, unknown>,
): Promise<void> {
	try {
		await findDaemonSession(id);
		await sendToDaemon(build(id));
	} catch (error) {
		failWith(error);
	}
}
