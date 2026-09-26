import type { SessionSocket } from "../../../useSessionSocket";
import { DiffView } from "./NodeScopedDiffView/DiffView";
import { RouteNodeScope } from "./RouteNodeScope";

export function NodeScopedDiffView({ socket }: { socket: SessionSocket }) {
	return (
		<RouteNodeScope defaultTo="selected">
			<DiffView sessions={socket.sessions} sendInput={socket.sendInput} />
		</RouteNodeScope>
	);
}
