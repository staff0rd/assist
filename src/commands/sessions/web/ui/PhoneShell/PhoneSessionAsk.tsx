import { displayStatus } from "../displayStatus";
import { isAwaitingUser } from "../isAwaitingUser";
import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneCheckCard } from "./PhoneCheckCard";
import { PhoneInputDock } from "./PhoneInputDock";
import { PhoneSessionQuestion } from "./PhoneSessionQuestion";
import { pendingCheck } from "./pendingCheck";
import { pendingQuestion } from "./pendingQuestion";
import { phaseLabel } from "./phaseLabel";
import type { usePhoneSessionIo } from "./usePhoneSessionIo";

export function PhoneSessionAsk({
	session,
	socket,
	io,
	keyboardOpen,
}: {
	session: SessionInfo;
	socket: SessionSocket;
	io: ReturnType<typeof usePhoneSessionIo>;
	keyboardOpen: boolean;
}) {
	const question = pendingQuestion(session);
	if (question)
		return (
			<PhoneSessionQuestion
				key={question.requestId}
				sessionId={session.id}
				question={question}
				socket={socket}
				keyboardOpen={keyboardOpen}
			/>
		);
	const check = pendingCheck(session);
	if (check)
		return (
			<PhoneCheckCard
				key={check.requestId}
				preview={check}
				phase={phaseLabel(session)}
				keyboardOpen={keyboardOpen}
				onDecision={(decision, details) =>
					socket.sendPrDecision(session.id, check.requestId, decision, details)
				}
			/>
		);
	return (
		<PhoneInputDock
			waiting={isAwaitingUser(displayStatus(session))}
			keyboardOpen={keyboardOpen}
			onKey={io.onKey}
			onSend={io.onSend}
		/>
	);
}
