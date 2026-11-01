import type { PrPreview } from "../../../shared/SessionInfoBase";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneSessionPreview } from "./PhoneSessionPreview";

export function PhonePendingPreview({
	preview,
	session,
	socket,
	keyboardOpen,
}: {
	preview: PrPreview;
	session: SessionInfo;
	socket: SessionSocket;
	keyboardOpen: boolean;
}) {
	return (
		<PhoneSessionPreview
			preview={preview}
			session={session}
			keyboardOpen={keyboardOpen}
			sendInput={socket.sendInput}
			onDecision={(decision, details) =>
				socket.sendPrDecision(session.id, preview.requestId, decision, details)
			}
		/>
	);
}
