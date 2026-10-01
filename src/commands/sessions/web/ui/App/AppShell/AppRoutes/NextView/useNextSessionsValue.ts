import { useMemo } from "react";
import type { SessionInfo } from "../../../../types";
import { useApiNode } from "../../../../useApiNode";
import { useActivateSession } from "../useActivateSession";
import type { NextSessions } from "./useNextSessions";

export function useNextSessionsValue(
	sessions: SessionInfo[],
	selectSession: (id: string) => void,
): NextSessions {
	const node = useApiNode() ?? "";
	const activate = useActivateSession(selectSession);
	return useMemo(
		() => ({
			sessions: sessions.filter((session) => (session.node ?? "") === node),
			activate,
		}),
		[sessions, node, activate],
	);
}
