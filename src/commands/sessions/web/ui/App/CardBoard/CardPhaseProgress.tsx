import Box from "@mui/material/Box";
import type { SessionInfo } from "../../types";
import { CardPhaseCaption } from "./CardPhaseCaption";
import { phaseProgress } from "./phaseProgress";
import { phaseSegmentSx } from "./phaseSegmentSx";
import type { PhaseTone } from "./PhaseTone";

export function CardPhaseProgress({
	session,
	tone,
}: {
	session: SessionInfo;
	tone: PhaseTone;
}) {
	const progress = phaseProgress(session);
	if (!progress) return null;
	return (
		<Box
			role="group"
			aria-label={progress.label}
			data-testid="card-phase-progress"
			sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}
		>
			<CardPhaseCaption count={progress.count} name={progress.name} />
			<Box aria-hidden sx={{ display: "flex", gap: "3px" }}>
				{progress.segments.map((state, i) => (
					<Box key={i} data-state={state} sx={phaseSegmentSx(state, tone)} />
				))}
			</Box>
		</Box>
	);
}
