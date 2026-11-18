import { childDismissFor } from "./childDismissFor";
import { nestUnderBacklogRun } from "./nestUnderBacklogRun";
import { sessionActionHandlers } from "./sessionActionHandlers";
import type {
	SessionControlHandlers,
	SessionInfo,
	SessionListHandlers,
} from "../types";

export function sessionControlHandlers(
	session: SessionInfo,
	sessions: SessionInfo[],
	lifecycle: SessionListHandlers,
): SessionControlHandlers {
	const children =
		nestUnderBacklogRun(sessions).find((row) => row.session.id === session.id)
			?.children ?? [];
	return {
		...sessionActionHandlers(session, lifecycle),
		childDismiss: childDismissFor(session, children, lifecycle.onDismiss),
		onSetAutoApprove: (enabled) =>
			lifecycle.onSetAutoApprove(session.id, enabled),
		onSetAutoAdvance: (enabled) =>
			lifecycle.onSetAutoAdvance(session.id, enabled),
	};
}
