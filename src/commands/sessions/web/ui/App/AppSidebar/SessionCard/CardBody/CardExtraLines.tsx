import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { CardToggle } from "../../../CardToggle";
import { displayStatus } from "../../../displayStatus";
import { sessionPhaseCaption } from "../../../sessionPhaseCaption";
import { SessionStatusCaptions } from "./CardExtraLines/SessionStatusCaptions";
import { sessionToggles } from "../../../sessionToggles";
import type { SessionInfo } from "../../../../types";

const rowSx = {
	gridColumn: "2 / -1",
	display: "flex",
	alignItems: "center",
	flexWrap: "wrap",
	gap: 1,
	minWidth: 0,
} as const;

const captionSx = {
	color: "text.secondary",
	overflowWrap: "anywhere",
} as const;

export function CardExtraLines({
	session,
	onSetAutoRun,
	onSetAutoAdvance,
}: {
	session: SessionInfo;
	onSetAutoRun: (enabled: boolean) => void;
	onSetAutoAdvance: (enabled: boolean) => void;
}) {
	const caption = sessionPhaseCaption(session);
	const toggles = sessionToggles(session);

	return (
		<>
			{caption && (
				<Box sx={rowSx}>
					<Typography variant="caption" sx={captionSx}>
						{caption}
					</Typography>
				</Box>
			)}
			<Box sx={rowSx}>
				<SessionStatusCaptions
					status={displayStatus(session)}
					restored={session.restored}
				/>
			</Box>
			{toggles.length > 0 && (
				<Box sx={rowSx}>
					{toggles.map((toggle) => (
						<CardToggle
							key={toggle.key}
							label={toggle.label}
							checked={toggle.checked}
							onChange={
								toggle.key === "autoRun" ? onSetAutoRun : onSetAutoAdvance
							}
						/>
					))}
				</Box>
			)}
		</>
	);
}
