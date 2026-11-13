import { displayStatus } from "../displayStatus";
import { isAwaitingUser } from "../isAwaitingUser";
import type { SessionInfo } from "../types";
import { PhoneInputDock } from "./PhoneInputDock";
import type { usePhoneSessionIo } from "./usePhoneSessionIo";

export function PhoneSessionDock({
	session,
	io,
	keyboardOpen,
}: {
	session: SessionInfo;
	io: ReturnType<typeof usePhoneSessionIo>;
	keyboardOpen: boolean;
}) {
	// why: the dock's keys and reply field drive a terminal, which an SDK session does not have
	if (session.sdk) return null;
	return (
		<PhoneInputDock
			harness={session.harness}
			cwd={session.cwd}
			node={session.node}
			waiting={isAwaitingUser(displayStatus(session))}
			keyboardOpen={keyboardOpen}
			onKey={io.onKey}
			onSend={io.onSend}
		/>
	);
}
