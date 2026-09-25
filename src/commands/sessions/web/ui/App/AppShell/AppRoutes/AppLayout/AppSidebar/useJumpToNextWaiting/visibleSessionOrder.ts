import { flattenSessionGroups } from "../flattenSessionGroups";
import { groupSessionsByRepo } from "../groupSessionsByRepo";
import type { SessionInfo } from "../../../../../../types";

export function visibleSessionOrder(
	sessions: SessionInfo[],
	isStarred: (session: SessionInfo) => boolean,
	isFloatingWaiter?: (session: SessionInfo) => boolean,
): SessionInfo[] {
	return flattenSessionGroups(
		groupSessionsByRepo(sessions, isStarred, isFloatingWaiter),
	);
}
