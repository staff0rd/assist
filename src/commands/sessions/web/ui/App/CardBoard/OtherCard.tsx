import Box from "@mui/material/Box";
import { statusPillSx } from "../../designSystem/statusPillSx";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { BoardCard } from "./BoardCard";
import { CardRepo } from "./CardRepo";
import { CardClose } from "./CardClose";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { otherChipColor } from "./otherChipColor";

export function OtherCard({
	session,
	selected,
	onOpen,
}: {
	session: SessionInfo;
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
				<CardRepo session={session} />
				<CardClose session={session} />
			</Box>
			<Box sx={[cardTextSx.title, clampSx(2)]}>{sessionTitle(session)}</Box>
		</BoardCard>
	);
}
