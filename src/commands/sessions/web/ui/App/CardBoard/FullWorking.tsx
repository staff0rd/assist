import Box from "@mui/material/Box";
import { useElapsed } from "../SessionContent/SessionArea/SessionAreaTopBar/ActiveSessionTopBar/SessionTopBar/SessionTopBarControls/SessionTopBarElapsed/useElapsed";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { workingActivity } from "./workingActivity";
import { workingDotSx } from "./workingDotSx";

export function FullWorking({ session }: { session: SessionInfo }) {
	const elapsed = useElapsed(session.runningMs, session.runningSince);
	return (
		<>
			<Box sx={cardTextSx.head}>
				<Box component="span" sx={workingDotSx} />
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
		</>
	);
}
