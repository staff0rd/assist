import { displayStatus } from "../../displayStatus";
import { isAwaitingUser } from "../../isAwaitingUser";
import type { SessionInfo, SessionStatus } from "../../types";
import { awaitingSince } from "./awaitingSince";

type BoardGroups = {
	needsYou: SessionInfo[];
	working: SessionInfo[];
	other: SessionInfo[];
	servers: SessionInfo[];
};

const OTHER: ReadonlySet<SessionStatus> = new Set([
	"error",
	"done",
	"stopped",
	"parked",
]);

export function groupBoardSessions(sessions: SessionInfo[]): BoardGroups {
	const groups: BoardGroups = {
		needsYou: [],
		working: [],
		other: [],
		servers: [],
	};
	for (const session of sessions) {
		const status = displayStatus(session);
		if (session.commandType === "run" && status !== "parked")
			groups.servers.push(session);
		else if (isAwaitingUser(status)) groups.needsYou.push(session);
		else if (status === "running") groups.working.push(session);
		else if (OTHER.has(session.status)) groups.other.push(session);
	}
	groups.needsYou.sort((a, b) => awaitingSince(b) - awaitingSince(a));
	return groups;
}
