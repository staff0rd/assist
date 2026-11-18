import type { SessionInfo } from "../../types";
import type { SessionSocket } from "../../useSessionSocket";
import { TerminalArea } from "../SessionContent/SessionArea/TerminalArea";

export function CardServerLog({
	session,
	socket,
}: {
	session: SessionInfo;
	socket: SessionSocket;
}) {
	return (
		<TerminalArea
			sessions={[session]}
			activeId={session.id}
			initialized={socket.initialized}
			onOutput={socket.onOutput}
			sendInput={socket.sendInput}
			sendResize={socket.sendResize}
		/>
	);
}
