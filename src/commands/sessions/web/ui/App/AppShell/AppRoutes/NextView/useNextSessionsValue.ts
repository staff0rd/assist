import { useMemo } from "react";
import type { SessionInfo } from "../../../../types";
import { useApiNode } from "../../../../useApiNode";
import { useActivateSession } from "../../../../useActivateSession";
import type { NextSessions } from "./useNextSessions";
import { useTrackedIssues } from "./useTrackedIssues";

export function useNextSessionsValue(
	sessions: SessionInfo[],
	selectSession: (id: string) => void,
): NextSessions {
	const node = useApiNode() ?? "";
	const activate = useActivateSession(selectSession);
	const local = useMemo(
		() => sessions.filter((session) => (session.node ?? "") === node),
		[sessions, node],
	);
	const trackedIssues = useTrackedIssues(local);
	return useMemo(
		() => ({ sessions: local, trackedIssues, activate }),
		[local, trackedIssues, activate],
	);
}
