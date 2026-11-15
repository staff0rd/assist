import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useStarredSessions } from "../../App/useStarredSessions";
import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneActionSheet } from "./PhoneActionSheet";
import { PhoneEndedToast } from "./PhoneEndedToast";
import type { PhoneSheetConfirm } from "./PhoneSheetConfirm";
import { useEndedToast } from "./useEndedToast";
import { PhoneActionsContext } from "./usePhoneActions";
import { usePhoneDismiss } from "./usePhoneDismiss";

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
	const ended = useEndedToast();
	const { markDismissed, announceEnded } = ended;

	const dismiss = usePhoneDismiss(socket.dismissSession, markDismissed);
	const openSheet = useCallback(
		(session: SessionInfo, confirm?: PhoneSheetConfirm) =>
			setTarget({ id: session.id, confirm }),
		[],
	);
	const value = useMemo(
		() => ({ openSheet, isStarred, toggleStar, dismiss, announceEnded }),
		[openSheet, isStarred, toggleStar, dismiss, announceEnded],
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
			<PhoneEndedToast
				open={ended.open}
				message={ended.message}
				onClose={ended.hide}
			/>
		</PhoneActionsContext.Provider>
	);
}
