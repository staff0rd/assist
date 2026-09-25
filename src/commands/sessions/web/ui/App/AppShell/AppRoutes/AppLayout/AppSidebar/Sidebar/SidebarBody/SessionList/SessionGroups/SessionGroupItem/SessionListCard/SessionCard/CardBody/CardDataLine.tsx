import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { GitStatusCounts } from "../../../../../../../../../../GitStatusCounts";
import { SessionMetaCaptions } from "./SessionMetaCaptions";
import type { SessionInfo } from "../../../../../../../../../../../../../types";
import { useElapsed } from "../../../../../../../../../../useElapsed";
import { useTopBarLayoutContext } from "../../../../../../../../../../../useTopBarLayoutContext";

const dataSx = {
	gridColumn: 3,
	gridRow: 2,
	display: "flex",
	alignItems: "center",
	justifyContent: "flex-end",
	gap: 0.75,
	minWidth: 0,
} as const;

const elapsedSx = {
	color: "text.disabled",
	whiteSpace: "nowrap",
	fontVariantNumeric: "tabular-nums",
} as const;

export function CardDataLine({ session }: { session: SessionInfo }) {
	const topBar = useTopBarLayoutContext();
	const elapsed = useElapsed(session.runningMs, session.runningSince);

	return (
		<Box sx={dataSx}>
			<SessionMetaCaptions
				usedPct={session.usedPct}
				harness={session.harness}
				undurable={session.undurable}
			/>
			{session.cwd && (
				<GitStatusCounts
					panelSessionId={session.id}
					cwd={session.cwd}
					sessionId={session.claudeSessionId}
				/>
			)}
			{!topBar && (
				<Typography variant="caption" sx={elapsedSx}>
					{elapsed}
				</Typography>
			)}
		</Box>
	);
}
