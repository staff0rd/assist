import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DiffPanelColumn } from "./SessionDiffSplit/DiffPanelColumn";
import type { SessionInfo } from "../../../types";
import { useDiffPanels } from "../../useDiffPanels";

const splitSx = {
	display: "flex",
	flex: 1,
	minHeight: 0,
	overflow: "hidden",
} as const;

export function SessionDiffSplit({
	sessionId,
	sessions,
	sendInput,
	children,
}: {
	sessionId: string | null;
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
	children: ReactNode;
}) {
	const panel = useDiffPanels().panelFor(sessionId);

	return (
		<Box sx={splitSx}>
			<Box
				sx={{
					display: panel?.mode === "full" ? "none" : "flex",
					width: panel ? "50%" : "100%",
					minWidth: 0,
				}}
			>
				{children}
			</Box>
			{panel && sessionId !== null && (
				<DiffPanelColumn
					key={sessionId}
					sessionId={sessionId}
					panel={panel}
					sessions={sessions}
					sendInput={sendInput}
				/>
			)}
		</Box>
	);
}
