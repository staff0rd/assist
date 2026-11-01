import { displayStatus } from "../displayStatus";
import type { SessionInfo } from "../types";

type PhoneSessionGroups = {
	questions: SessionInfo[];
	needsYou: SessionInfo[];
	running: SessionInfo[];
	done: SessionInfo[];
};

export function groupSessionsByStatus(
	sessions: SessionInfo[],
): PhoneSessionGroups {
	const groups: PhoneSessionGroups = {
		questions: [],
		needsYou: [],
		running: [],
		done: [],
	};
	for (const session of sessions) {
		const status = displayStatus(session);
		if (status === "question") groups.questions.push(session);
		else if (status === "waiting" || status === "error")
			groups.needsYou.push(session);
		else if (status === "running") groups.running.push(session);
		else groups.done.push(session);
	}
	return groups;
}
