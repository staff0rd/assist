import { useState } from "react";
import type { SessionSocket } from "../../useSessionSocket";
import { useCloseWhenPreviewEnds } from "./useCloseWhenPreviewEnds";

export function useOpenCard(socket: SessionSocket) {
	const [openId, setOpenId] = useState<string | null>(null);
	const [sessionShown, setSessionShown] = useState(true);
	const openSession = socket.sessions.find((s) => s.id === openId);
	const close = () => {
		setOpenId(null);
		setSessionShown(true);
	};
	useCloseWhenPreviewEnds(openSession, sessionShown, close);
	return {
		openSession,
		sessionShown: sessionShown && openSession !== undefined,
		toggleSession: () => setSessionShown((shown) => !shown),
		showSession: () => setSessionShown(true),
		open: (id: string) => {
			if (id !== openId) setSessionShown(true);
			setOpenId(id);
			socket.selectSession(id);
		},
		close,
	};
}
