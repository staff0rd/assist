import { sessionControlHandlers } from "../../../sessionControlHandlers";
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
	return (
		<SessionTopBar
			key={session.id}
			session={session}
			{...sessionControlHandlers(session, sessions, lifecycle)}
		/>
	);
}
