import { useState } from "react";
import type { SessionSocket } from "../../useSessionSocket";

export function useOpenCard(socket: SessionSocket) {
	const [openId, setOpenId] = useState<string | null>(null);
	const [sessionShown, setSessionShown] = useState(false);
	const openSession = socket.sessions.find((s) => s.id === openId);
	return {
		openSession,
		sessionShown: sessionShown && openSession !== undefined,
		toggleSession: () => setSessionShown((shown) => !shown),
		open: (id: string) => {
			if (id !== openId) setSessionShown(false);
			setOpenId(id);
			socket.selectSession(id);
		},
		close: () => {
			setOpenId(null);
			setSessionShown(false);
		},
	};
}
