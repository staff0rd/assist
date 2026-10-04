import type { Session } from "../types";
import { canonicalTreePath } from "./canonicalTreePath";

const ENDED: Session["status"][] = ["done", "error"];

export function liveEscalationIn(
	sessions: Map<string, Session>,
	clone: string,
): Session | undefined {
	return [...sessions.values()].find(
		(s) =>
			s.divergenceEscalation === true &&
			s.cwd !== undefined &&
			canonicalTreePath(s.cwd) === clone &&
			!ENDED.includes(s.status),
	);
}
