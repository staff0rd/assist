import { harnessResumesConversation } from "../../../../../shared/harnessResumesConversation";
import type {
	DismissOptions,
	SessionInfo,
	SessionLifecycleHandlers,
} from "../types";

export function sessionActionHandlers(
	session: SessionInfo,
	handlers: SessionLifecycleHandlers,
): {
	onRetry?: (replace?: boolean) => void;
	onRestart?: () => void;
	onStartOver?: () => void;
	onDismiss: (opts?: DismissOptions) => void;
} {
	const retryable = session.commandType === "run" || needsRelaunch(session);
	const restartable = session.commandType !== "run" && relaunchable(session);
	return {
		onRetry: retryable
			? (replace) => handlers.onRetry(session.id, replace)
			: undefined,
		onRestart: restartable ? () => handlers.onRestart(session.id) : undefined,
		onStartOver:
			restartable && session.status !== "stopped" && handlers.onStartOver
				? () => handlers.onStartOver?.(session.id)
				: undefined,
		onDismiss: (opts) => handlers.onDismiss(session.id, opts),
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
