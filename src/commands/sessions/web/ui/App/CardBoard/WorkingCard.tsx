import Box from "@mui/material/Box";
import { BoardCard } from "./BoardCard";
import { alpha } from "@mui/material/styles";
import { useElapsed } from "../SessionContent/SessionArea/SessionAreaTopBar/ActiveSessionTopBar/SessionTopBar/SessionTopBarControls/SessionTopBarElapsed/useElapsed";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { workingActivity } from "./workingActivity";

const dotSx = {
	width: 8,
	height: 8,
	borderRadius: "50%",
	bgcolor: "success.main",
	boxShadow: (t: { palette: { success: { main: string } } }) =>
		`0 0 0 3px ${alpha(t.palette.success.main, 0.18)}`,
} as const;

export function WorkingCard({
	session,
	selected,
	onOpen,
}: {
	session: SessionInfo;
	selected: boolean;
	onOpen: () => void;
}) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);
	return (
		<BoardCard
			tone="neutral"
			selected={selected}
			onOpen={onOpen}
			testId="working-card"
		>
			<Box sx={cardTextSx.head}>
				<Box component="span" sx={dotSx} />
				<Box
					component="span"
					sx={{ typography: "caption", fontWeight: 600, color: "success.main" }}
				>
					Working
				</Box>
				<Box component="span" sx={cardTextSx.age}>
					{elapsed}
				</Box>
			</Box>
			<Box sx={[cardTextSx.title, clampSx(2)]}>{sessionTitle(session)}</Box>
			<Box
				sx={[
					{
						typography: "body2",
						fontFamily: "fontFamilyMono",
						color: "text.secondary",
					},
					clampSx(3),
				]}
			>
				{workingActivity(session)}
			</Box>
		</BoardCard>
	);
}
