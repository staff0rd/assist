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
	nowMs,
	selected,
	compact,
	onOpen,
}: {
	session: SessionInfo;
	nowMs: number;
	selected: boolean;
	compact: boolean;
	onOpen: () => void;
}) {
	const chip = needsYouChip(session);
	return (
		<BoardCard
			tone={chip.color}
			selected={selected}
			compact={compact}
			onOpen={onOpen}
			testId="needs-you-card"
		>
			<NeedsYouCardHead session={session} chip={chip} nowMs={nowMs} />
			<Box
				sx={[compact ? cardTextSx.compactTitle : cardTextSx.title, clampSx(2)]}
			>
				{sessionTitle(session)}
			</Box>
			{!compact && (
				<Box
					sx={[
						{ typography: "body2", color: "text.primary", opacity: 0.85 },
						clampSx(4),
					]}
				>
					{askedText(session)}
				</Box>
			)}
		</BoardCard>
	);
}
