import { formatItemId } from "../../../backlog/formatItemId";
import type { AutopilotHeldMember } from "./AutopilotDeps";
import type { AutopilotStarted } from "./AutopilotStarted";
import type { AutopilotStore } from "./createAutopilotStore";
import { pauseOnFailure } from "./pauseOnFailure";

export function pauseHeldMember(
	store: AutopilotStore,
	started: AutopilotStarted,
	cwd: string,
	member: AutopilotHeldMember,
	reason: string,
): true {
	pauseOnFailure(store, started.deps, cwd, {
		item: member.itemId === undefined ? undefined : formatItemId(member.itemId),
		phase: member.phase,
		sessionId: member.sessionId,
		reason,
	});
	return true;
}
