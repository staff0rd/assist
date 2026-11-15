import { useCallback } from "react";
import { useMatch, useNavigate } from "react-router";
import type { DismissOptions, SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";

export function usePhoneDismiss(
	dismissSession: SessionSocket["dismissSession"],
	markDismissed: (id: string) => void,
) {
	const openRoute = useMatch("/session/:id")?.params.id;
	const navigate = useNavigate();
	return useCallback(
		(session: SessionInfo, opts?: DismissOptions) => {
			markDismissed(session.id);
			dismissSession(session.id, opts);
			if (openRoute === session.id) navigate("/", { replace: true });
		},
		[dismissSession, openRoute, navigate, markDismissed],
	);
}
