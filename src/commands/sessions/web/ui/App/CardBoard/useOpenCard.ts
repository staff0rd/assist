import { useState } from "react";
import type { SessionSocket } from "../../useSessionSocket";

export function useOpenCard(socket: SessionSocket) {
	const [openId, setOpenId] = useState<string | null>(null);
	const openSession = socket.sessions.find((s) => s.id === openId);
	return {
		openSession,
		open: (id: string) => {
			setOpenId(id);
			socket.selectSession(id);
		},
		close: () => setOpenId(null),
	};
}
