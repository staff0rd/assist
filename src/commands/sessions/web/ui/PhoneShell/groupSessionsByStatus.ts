import { displayStatus } from "../displayStatus";
import type { SessionInfo } from "../types";

type PhoneSessionGroups = {
	needsYou: SessionInfo[];
	running: SessionInfo[];
	done: SessionInfo[];
};

export function groupSessionsByStatus(
	sessions: SessionInfo[],
): PhoneSessionGroups {
	const groups: PhoneSessionGroups = { needsYou: [], running: [], done: [] };
	for (const session of sessions) {
		const status = displayStatus(session);
		if (status === "waiting" || status === "error")
			groups.needsYou.push(session);
		else if (status === "running") groups.running.push(session);
		else groups.done.push(session);
	}
	return groups;
}
