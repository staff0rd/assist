import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SessionLoadingOverlay } from "./SessionLoadingOverlay";
import { TerminalPane } from "./TerminalPane";
import type { SessionInfo } from "./types";

type OutputHandler = (data: string) => void;
type OutputSubscriber = (
	sessionId: string,
	handler: OutputHandler,
) => () => void;

export function SessionArea({
	sessions,
	activeId,
	initialized,
	onOutput,
	sendInput,
	sendResize,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	initialized: Set<string>;
	onOutput: OutputSubscriber;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: (sessionId: string, cols: number, rows: number) => void;
}) {
	// why: a new session's terminal is empty until its process emits output, so the previously active pane would otherwise show through
	const activeLoading =
		activeId !== null &&
		sessions.some((s) => s.id === activeId) &&
		!initialized.has(activeId);

	return (
		<Box sx={{ flex: 1, position: "relative", bgcolor: "background.default" }}>
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
			{activeLoading && <SessionLoadingOverlay />}
			{sessions.length === 0 && (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%",
					}}
				>
					<Typography variant="body2" color="text.disabled">
						Create a session to get started
					</Typography>
				</Box>
			)}
		</Box>
	);
}
