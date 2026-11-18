import { displayStatus } from "../../displayStatus";
import { isAwaitingUser } from "../../isAwaitingUser";
import type { SessionInfo } from "../../types";
import { awaitingSince } from "./awaitingSince";

type BoardGroups = {
	needsYou: SessionInfo[];
	working: SessionInfo[];
};

export function groupBoardSessions(sessions: SessionInfo[]): BoardGroups {
	const needsYou: SessionInfo[] = [];
	const working: SessionInfo[] = [];
	for (const session of sessions) {
		const status = displayStatus(session);
		if (isAwaitingUser(status)) needsYou.push(session);
		else if (status === "running" && session.commandType !== "run")
			working.push(session);
	}
	needsYou.sort((a, b) => awaitingSince(b) - awaitingSince(a));
	return { needsYou, working };
}
