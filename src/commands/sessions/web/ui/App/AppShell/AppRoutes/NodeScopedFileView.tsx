import type { SessionSocket } from "../../../useSessionSocket";
import { selectedCardId } from "../selectedCardId";
import { FileView } from "./FileView";
import { RouteNodeScope } from "./RouteNodeScope";

export function NodeScopedFileView({ socket }: { socket: SessionSocket }) {
	return (
		<RouteNodeScope defaultTo="worktree">
			<FileView
				sessions={socket.sessions}
				sendInput={socket.sendInput}
				cardId={selectedCardId(socket)}
			/>
		</RouteNodeScope>
	);
}
