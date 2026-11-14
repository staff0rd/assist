import type { SessionSocket } from "../../../useSessionSocket";
import { RulesView } from "../../RulesView";
import { selectedCardId } from "../selectedCardId";

export function RulesRoute({ socket }: { socket: SessionSocket }) {
	return (
		<RulesView
			sessions={socket.sessions}
			cardId={selectedCardId(socket)}
			sendInput={socket.sendInput}
		/>
	);
}
