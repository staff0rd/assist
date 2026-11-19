import type { SessionInfo } from "../daemon/createSession";
import { sendToDaemon } from "../daemon/sendToDaemon";
import { failWith } from "../previews/failWith";
import { findDaemonSession } from "../previews/findDaemonSession";

export type SessionRefusal = (session: SessionInfo) => string | undefined;

export async function sendToSession(
	id: string,
	build: (sessionId: string) => Record<string, unknown>,
	refuse?: SessionRefusal,
): Promise<void> {
	try {
		const session = await findDaemonSession(id);
		const refusal = refuse?.(session);
		if (refusal) throw new Error(refusal);
		await sendToDaemon(build(id));
	} catch (error) {
		failWith(error);
	}
}
