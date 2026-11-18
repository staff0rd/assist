import Box from "@mui/material/Box";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { CardBacklogChips } from "./CardBacklogChips";
import { CardRepo } from "./CardRepo";
import { CardClose } from "./CardClose";
import { CardPhaseProgress } from "./CardPhaseProgress";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { workingActivity } from "./workingActivity";
import { workingDotSx } from "./workingDotSx";
import { sessionTypeSize } from "../sessionTypeSize";

export function FullWorking({ session }: { session: SessionInfo }) {
	return (
		<>
			<Box sx={cardTextSx.head}>
				<Box component="span" sx={workingDotSx} />
				<Box
					component="span"
					sx={{
						typography: "caption",
						fontSize: sessionTypeSize("caption"),
						fontWeight: 600,
						color: "success.main",
					}}
				>
					Working
				</Box>
				<CardBacklogChips session={session} />
				<CardRepo session={session} />
				<CardClose session={session} />
			</Box>
			<Box sx={[cardTextSx.title, clampSx(2)]}>{sessionTitle(session)}</Box>
			<Box
				sx={[
					{
						typography: "body2",
						fontSize: sessionTypeSize("body2"),
						fontFamily: "fontFamilyMono",
						color: "text.secondary",
					},
					clampSx(3),
				]}
			>
				{workingActivity(session)}
			</Box>
			<CardPhaseProgress session={session} tone="working" />
		</>
	);
}
