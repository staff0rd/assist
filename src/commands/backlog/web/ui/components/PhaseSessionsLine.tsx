import { Box, Typography } from "@mui/material";
import type { PhaseSession } from "../types";

const labelSx = {
	color: "text.secondary",
	fontSize: "0.75rem",
	letterSpacing: "0.08em",
	display: "block",
} as const;

const sessionSx = {
	color: "text.secondary",
	fontSize: "0.75rem",
	fontFamily: "monospace",
	display: "block",
} as const;

export function PhaseSessionsLine({ sessions }: { sessions: PhaseSession[] }) {
	return (
		<Box sx={{ mb: 1 }}>
			<Typography variant="overline" sx={labelSx}>
				Sessions
			</Typography>
			{sessions.map((s) => (
				<Typography key={s.claudeSessionId} sx={sessionSx}>
					{`${s.hostname} / ${s.osUser} / ${s.claudeSessionId}`}
				</Typography>
			))}
		</Box>
	);
}
