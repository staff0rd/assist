import type { Session } from "../types";
import type { AutopilotRunItem } from "./AutopilotDeps";

/** The session as an item of the run rooted at rootId, if it runs a backlog item there. */
export function autopilotRunItem(
	session: Session,
	rootId: string,
): AutopilotRunItem[] {
	const itemId = session.activity?.itemId;
	if (session.autopilot !== rootId || itemId === undefined) return [];
	return [
		{
			itemId,
			sessionId: session.id,
			live: session.status !== "done" && session.status !== "error",
			...(session.status === "error"
				? { error: session.error ?? "unknown error" }
				: {}),
		},
	];
}
