import type { SessionInfo } from "../types";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneSessionDock } from "./PhoneSessionDock";
import { PhonePendingPreview } from "./PhonePendingPreview";
import { PhoneSessionCheck } from "./PhoneSessionCheck";
import { PhoneSessionQuestion } from "./PhoneSessionQuestion";
import { pendingCheck } from "./pendingCheck";
import { pendingPreview } from "./pendingPreview";
import { pendingQuestion } from "./pendingQuestion";
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
	const shared = { session, socket, keyboardOpen };
	const preview = pendingPreview(session);
	if (preview)
		return (
			<PhonePendingPreview
				key={preview.requestId}
				preview={preview}
				{...shared}
			/>
		);
	const question = pendingQuestion(session);
	if (question)
		return (
			<PhoneSessionQuestion
				key={question.requestId}
				sessionId={session.id}
				cwd={session.cwd}
				question={question}
				socket={socket}
				keyboardOpen={keyboardOpen}
			/>
		);
	const check = pendingCheck(session);
	if (check)
		return (
			<PhoneSessionCheck key={check.requestId} check={check} {...shared} />
		);
	return (
		<PhoneSessionDock session={session} io={io} keyboardOpen={keyboardOpen} />
	);
}
