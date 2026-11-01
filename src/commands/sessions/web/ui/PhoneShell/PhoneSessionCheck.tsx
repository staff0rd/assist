import type { PrPreview } from "../../../shared/SessionInfoBase";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneCheckCard } from "./PhoneCheckCard";
import { phaseLabel } from "./phaseLabel";

export function PhoneSessionCheck({
	session,
	check,
	socket,
	keyboardOpen,
}: {
	session: SessionInfo;
	check: PrPreview;
	socket: SessionSocket;
	keyboardOpen: boolean;
}) {
	return (
		<PhoneCheckCard
			preview={check}
			phase={phaseLabel(session)}
			keyboardOpen={keyboardOpen}
			onDecision={(decision, details) =>
				socket.sendPrDecision(session.id, check.requestId, decision, details)
			}
		/>
	);
}
