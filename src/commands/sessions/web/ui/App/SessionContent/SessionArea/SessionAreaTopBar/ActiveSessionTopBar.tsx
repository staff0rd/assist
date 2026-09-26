import { sessionActionHandlers } from "../../../sessionActionHandlers";
import { SessionTopBar } from "./ActiveSessionTopBar/SessionTopBar";
import type { SessionInfo, SessionListHandlers } from "../../../../types";

export function ActiveSessionTopBar({
	session,
	lifecycle,
}: {
	session: SessionInfo;
	lifecycle: SessionListHandlers;
}) {
	return (
		<SessionTopBar
			key={session.id}
			session={session}
			{...sessionActionHandlers(session, lifecycle)}
			onSetAutoRun={(enabled) => lifecycle.onSetAutoRun(session.id, enabled)}
			onSetAutoAdvance={(enabled) =>
				lifecycle.onSetAutoAdvance(session.id, enabled)
			}
		/>
	);
}
