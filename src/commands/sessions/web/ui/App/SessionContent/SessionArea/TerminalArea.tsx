import { isSessionStarting } from "../../isSessionStarting";
import { TerminalPanes } from "./TerminalArea/TerminalPanes";
import type { SessionInfo } from "../../../types";

type OutputSubscriber = (
	sessionId: string,
	handler: (data: string) => void,
) => () => void;

export type TerminalAreaProps = {
	sessions: SessionInfo[];
	activeId: string | null;
	initialized: Set<string>;
	onOutput: OutputSubscriber;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: (sessionId: string, cols: number, rows: number) => void;
};

export function TerminalArea({
	sessions,
	activeId,
	initialized,
	onOutput,
	sendInput,
	sendResize,
}: TerminalAreaProps) {
	// why: a new session's terminal is empty until its process emits output, so the previously active pane would otherwise show through
	const activeSession = sessions.find((s) => s.id === activeId);
	const activeLoading =
		activeSession !== undefined &&
		isSessionStarting(activeSession, initialized);

	return (
		<TerminalPanes
			sessions={sessions}
			activeId={activeId}
			activeLoading={activeLoading}
			onOutput={onOutput}
			sendInput={sendInput}
			sendResize={sendResize}
		/>
	);
}
