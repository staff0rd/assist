import Box from "@mui/material/Box";
import { statusPillSx } from "../../designSystem/statusPillSx";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { awaitingSince } from "./awaitingSince";
import { BoardCard } from "./BoardCard";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { formatAge } from "./formatAge";
import { otherChipColor } from "./otherChipColor";

export function OtherCard({
	session,
	nowMs,
	selected,
	onOpen,
}: {
	session: SessionInfo;
	nowMs: number;
	selected: boolean;
	onOpen: () => void;
}) {
	return (
		<BoardCard
			tone="neutral"
			selected={selected}
			onOpen={onOpen}
			testId="other-card"
		>
			<Box sx={cardTextSx.head}>
				<Box
					component="span"
					sx={[
						statusPillSx(otherChipColor(session.status)),
						{ typography: "caption", fontWeight: 600, py: 0.25 },
					]}
				>
					{session.status}
				</Box>
				<Box component="span" sx={cardTextSx.age}>
					{formatAge(awaitingSince(session), nowMs)}
				</Box>
			</Box>
			<Box sx={[cardTextSx.title, clampSx(2)]}>{sessionTitle(session)}</Box>
		</BoardCard>
	);
}
