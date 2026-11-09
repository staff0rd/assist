import { harnessAdapter } from "../../../shared/harnessAdapters/harnessAdapter";
import { saveSessionTitle } from "../shared/loadSessionTitles";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";

export function rememberSessionTitle(session: Session): void {
	const conversationId = harnessAdapter(session.harness).conversation.boundId(
		session,
	);
	const title = session.title ?? session.generatedTitle;
	if (!conversationId || !title) return;
	try {
		if (saveSessionTitle(conversationId, title))
			daemonLog(`session ${session.id} title kept for ${conversationId}`);
	} catch (error) {
		daemonLog(`session ${session.id} title not saved: ${error}`);
	}
}
