import type { SessionSocket } from "../../useSessionSocket";

export function selectedCardId(socket: SessionSocket): string | null {
	return socket.viewingTranscriptSessionId ?? socket.activeId;
}
