import { sdkComposerState } from "../App/SessionContent/SessionArea/SdkComposer/sdkComposerState";
import { useRunShellCommand } from "../App/SessionContent/SessionArea/TranscriptArea/useRunShellCommand";
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
	const runShell = useRunShellCommand();
	const sdk = session.sdk ? sdkComposerState(session) : undefined;
	if (sdk && !sdk.live) return null;
	return (
		<PhoneInputDock
			harness={session.harness}
			cwd={session.cwd}
			node={session.node}
			waiting={isAwaitingUser(displayStatus(session))}
			keyboardOpen={keyboardOpen}
			// why: the key strip drives a terminal, which an SDK session does not have
			onKey={sdk ? undefined : io.onKey}
			onSend={io.onSend}
			onRunShell={
				sdk && runShell ? (command) => runShell(session.id, command) : undefined
			}
			locked={sdk?.resuming ? sdk.placeholder : undefined}
			suggestion={sdk?.suggestion}
			draftSessionId={sdk && session.id}
			stop={
				sdk?.running
					? { disabled: sdk.stopping, onStop: io.onInterrupt }
					: undefined
			}
		/>
	);
}
