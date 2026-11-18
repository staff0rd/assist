import Box from "@mui/material/Box";
import { BoardCard } from "./BoardCard";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { askedText } from "./askedText";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { needsYouChip } from "./needsYouChip";
import { NeedsYouCardHead } from "./NeedsYouCardHead";

export function NeedsYouCard({
	session,
	selected,
	onOpen,
}: {
	session: SessionInfo;
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
			<NeedsYouCardHead session={session} chip={chip} />
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
