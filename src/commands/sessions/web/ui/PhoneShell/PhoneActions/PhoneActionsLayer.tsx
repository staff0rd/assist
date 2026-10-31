import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useMatch, useNavigate } from "react-router";
import { useStarredSessions } from "../../App/useStarredSessions";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneActionSheet } from "./PhoneActionSheet";
import type { PhoneSheetConfirm } from "./PhoneSheetConfirm";
import { PhoneActionsContext } from "./usePhoneActions";

type Target = { id: string; confirm?: PhoneSheetConfirm };

export function PhoneActionsLayer({
	socket,
	children,
}: {
	socket: SessionSocket;
	children: ReactNode;
}) {
	const { isStarred, toggleStar } = useStarredSessions();
	const [target, setTarget] = useState<Target | null>(null);
	const openRoute = useMatch("/session/:id")?.params.id;
	const navigate = useNavigate();
	const { dismissSession } = socket;

	const dismiss = useCallback(
		(session: SessionInfo) => {
			dismissSession(session.id);
			if (openRoute === session.id) navigate("/", { replace: true });
		},
		[dismissSession, openRoute, navigate],
	);
	const openSheet = useCallback(
		(session: SessionInfo, confirm?: PhoneSheetConfirm) =>
			setTarget({ id: session.id, confirm }),
		[],
	);
	const value = useMemo(
		() => ({ openSheet, isStarred, toggleStar, dismiss }),
		[openSheet, isStarred, toggleStar, dismiss],
	);

	return (
		<PhoneActionsContext.Provider value={value}>
			{children}
			<PhoneActionSheet
				session={socket.sessions.find((s) => s.id === target?.id)}
				confirm={target?.confirm}
				onConfirm={(confirm) => setTarget((t) => t && { ...t, confirm })}
				onClose={() => setTarget(null)}
				socket={socket}
			/>
		</PhoneActionsContext.Provider>
	);
}
