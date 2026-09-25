import type { SessionInfo } from "../types";

export type CommentTarget =
	| { session: SessionInfo; unavailable?: undefined }
	| { session?: undefined; unavailable: string };

export function commentTarget(session: SessionInfo | undefined): CommentTarget {
	if (!session || session.status === "stopped" || session.closing === true)
		return {
			unavailable: "Comments are unavailable — that session is no longer live.",
		};
	return { session };
}
