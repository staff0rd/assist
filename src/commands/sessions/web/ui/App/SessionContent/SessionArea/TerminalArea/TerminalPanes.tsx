import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SessionLoadingOverlay } from "./TerminalPanes/SessionLoadingOverlay";
import { TerminalPane } from "./TerminalPanes/TerminalPane";
import type { SessionInfo } from "../../../../types";

type OutputSubscriber = (
	sessionId: string,
	handler: (data: string) => void,
) => () => void;

export function TerminalPanes({
	sessions,
	activeId,
	activeLoading,
	onOutput,
	sendInput,
	sendResize,
}: {
	sessions: SessionInfo[];
	activeId: string | null;
	activeLoading: boolean;
	onOutput: OutputSubscriber;
	sendInput: (sessionId: string, data: string) => void;
	sendResize: (sessionId: string, cols: number, rows: number) => void;
}) {
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
