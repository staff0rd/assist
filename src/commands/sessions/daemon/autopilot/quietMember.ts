import type { Session } from "../types";

/** A run member whose turn ended with no preview, permission prompt or queued input pending. */
export function quietMember(session: Session): boolean {
	return (
		session.status === "waiting" &&
		session.waitingSince !== null &&
		!session.pendingPrPreview &&
		!session.permissionActive &&
		!session.pendingPrompts?.length &&
		!session.deferredCommands?.length
	);
}
