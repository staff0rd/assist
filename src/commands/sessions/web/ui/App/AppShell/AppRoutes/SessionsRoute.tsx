import { CardBoard } from "../../CardBoard";
import { SessionContent } from "../../SessionContent";
import { useCardModeContext } from "../../useCardModeContext";
import type { SessionSocket } from "../../../useSessionSocket";

export function SessionsRoute({ socket }: { socket: SessionSocket }) {
	const { cardMode } = useCardModeContext();
	if (cardMode) return <CardBoard socket={socket} />;
	return <SessionContent socket={socket} />;
}
