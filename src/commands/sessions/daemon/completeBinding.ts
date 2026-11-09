import { claimConversation } from "./claimedByOthers";
import type { Session } from "./createSession";
import { daemonLog } from "./daemonLog";
import { recordBoundPhaseSession } from "./recordBoundPhaseSession";
import { rememberSessionTitle } from "./rememberSessionTitle";

export function completeBinding(
	session: Session,
	bound: { conversationId: string; harnessLabel: string },
	notify: () => void,
	onBound?: (session: Session) => void,
): void {
	const { conversationId, harnessLabel } = bound;
	claimConversation(session, conversationId);
	daemonLog(
		`session ${session.id} bound to ${harnessLabel} conversation ${conversationId}`,
	);
	rememberSessionTitle(session);
	void recordBoundPhaseSession(session, conversationId);
	onBound?.(session);
	notify();
}
