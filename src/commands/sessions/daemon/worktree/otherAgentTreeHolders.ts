import type { Session } from "../createSession";
import { otherTreeHolders } from "./otherTreeHolders";

export function otherAgentTreeHolders(
	sessions: Map<string, Session>,
	session: Session,
): Session[] {
	return otherTreeHolders(sessions, session).filter(
		(s) => s.commandType !== "run",
	);
}
