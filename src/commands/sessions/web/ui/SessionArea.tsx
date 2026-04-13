import type { CSSProperties } from "react";
import { TerminalPane } from "./TerminalPane";
import type { SessionInfo } from "./types";

type OutputHandler = (data: string) => void;
type OutputSubscriber = (
	sessionId: string,
	handler: OutputHandler,
) => () => void;

const containerStyle: CSSProperties = {
	flex: 1,
	position: "relative",
	background: "#1e1e1e",
};

const emptyStyle: CSSProperties = {
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	height: "100%",
	color: "#666",
	fontSize: 14,
};

export function SessionArea({
	sessions,
	activeId,
	onOutput,
	sendInput,
	sendResize,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	onOutput: OutputSubscriber;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: (sessionId: string, cols: number, rows: number) => void;
}) {
	return (
		<div style={containerStyle}>
			{sessions.map((s) => (
				<TerminalPane
					key={s.id}
					sessionId={s.id}
					visible={s.id === activeId}
					onOutput={onOutput}
					sendInput={sendInput}
					sendResize={sendResize}
				/>
			))}
			{sessions.length === 0 && (
				<div style={emptyStyle}>Create a session to get started</div>
			)}
		</div>
	);
}
