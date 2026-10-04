import { nestUnderBacklogRun } from "../../../nestUnderBacklogRun";
import { childDismissFor } from "../../../childDismissFor";
import { sessionActionHandlers } from "../../../sessionActionHandlers";
import { SessionTopBar } from "./ActiveSessionTopBar/SessionTopBar";
import type { SessionInfo, SessionListHandlers } from "../../../../types";

export function ActiveSessionTopBar({
	session,
	sessions,
	lifecycle,
}: {
	session: SessionInfo;
	sessions: SessionInfo[];
	lifecycle: SessionListHandlers;
}) {
	const children =
		nestUnderBacklogRun(sessions).find((row) => row.session.id === session.id)
			?.children ?? [];
	return (
		<SessionTopBar
			key={session.id}
			session={session}
			{...sessionActionHandlers(session, lifecycle)}
			childDismiss={childDismissFor(session, children, lifecycle.onDismiss)}
			onSetAutoRun={(enabled) => lifecycle.onSetAutoRun(session.id, enabled)}
			onSetAutoAdvance={(enabled) =>
				lifecycle.onSetAutoAdvance(session.id, enabled)
			}
		/>
	);
}
