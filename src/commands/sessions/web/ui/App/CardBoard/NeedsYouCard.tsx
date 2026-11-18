import Box from "@mui/material/Box";
import { BoardCard } from "./BoardCard";
import { statusPillSx } from "../../designSystem/statusPillSx";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { askedText } from "./askedText";
import { awaitingSince } from "./awaitingSince";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { formatAge } from "./formatAge";
import { needsYouChip } from "./needsYouChip";

export function NeedsYouCard({
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
	const chip = needsYouChip(session);
	return (
		<BoardCard
			tone={chip.color}
			selected={selected}
			onOpen={onOpen}
			testId="needs-you-card"
		>
			<Box sx={cardTextSx.head}>
				<Box
					component="span"
					sx={[
						statusPillSx(`${chip.color}.main`),
						{ typography: "caption", fontWeight: 600, py: 0.25 },
					]}
				>
					{chip.label}
				</Box>
				<Box component="span" sx={cardTextSx.age}>
					{formatAge(awaitingSince(session), nowMs)}
				</Box>
			</Box>
			<Box sx={[cardTextSx.title, clampSx(2)]}>{sessionTitle(session)}</Box>
			<Box
				sx={[
					{ typography: "body2", color: "text.primary", opacity: 0.85 },
					clampSx(4),
				]}
			>
				{askedText(session)}
			</Box>
		</BoardCard>
	);
}
