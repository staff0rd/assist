import type { PrPreview } from "../../../shared/SessionInfoBase";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneQuestionCard } from "./PhoneQuestionCard";

export function PhoneSessionQuestion({
	sessionId,
	cwd,
	question,
	socket,
	keyboardOpen,
}: {
	sessionId: string;
	cwd: string | undefined;
	question: PrPreview;
	socket: SessionSocket;
	keyboardOpen: boolean;
}) {
	return (
		<PhoneQuestionCard
			key={question.requestId}
			preview={question}
			cwd={cwd}
			keyboardOpen={keyboardOpen}
			onDecision={(decision, details) =>
				socket.sendPrDecision(sessionId, question.requestId, decision, details)
			}
		/>
	);
}
