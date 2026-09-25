import { harnessResumesConversation } from "../../../../../../../shared/harnessResumesConversation";
import type { SessionInfo, SessionLifecycleHandlers } from "../../../types";

export function sessionActionHandlers(
	session: SessionInfo,
	handlers: SessionLifecycleHandlers,
): {
	onRetry?: () => void;
	onRestart?: () => void;
	onDismiss: () => void;
} {
	const retryable = session.commandType === "run" || needsRelaunch(session);
	const restartable = session.commandType !== "run" && relaunchable(session);
	return {
		onRetry: retryable ? () => handlers.onRetry(session.id) : undefined,
		onRestart: restartable ? () => handlers.onRestart(session.id) : undefined,
		onDismiss: () => handlers.onDismiss(session.id),
	};
}

function relaunchable(session: SessionInfo): boolean {
	return (
		harnessResumesConversation(session.harness) ||
		session.commandType === "assist"
	);
}

function needsRelaunch(session: SessionInfo): boolean {
	return (
		session.commandType === "assist" &&
		session.restored === false &&
		!!session.assistArgs
	);
}
