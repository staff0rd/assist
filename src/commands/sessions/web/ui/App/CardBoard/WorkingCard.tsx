import Box from "@mui/material/Box";
import { BoardCard } from "./BoardCard";
import { workingDotSx } from "./workingDotSx";
import { sessionTitle } from "../sessionTitle";
import type { SessionInfo } from "../../types";
import { cardTextSx } from "./cardTextSx";
import { clampSx } from "./clampSx";
import { FullWorking } from "./FullWorking";

function CompactWorking({ session }: { session: SessionInfo }) {
	return (
		<Box sx={cardTextSx.head}>
			<Box component="span" sx={workingDotSx} />
			<Box sx={[cardTextSx.compactTitle, clampSx(2)]}>
				{sessionTitle(session)}
			</Box>
		</Box>
	);
}

export function WorkingCard({
	session,
	selected,
	compact,
	onOpen,
}: {
	session: SessionInfo;
	selected: boolean;
	compact: boolean;
	onOpen: () => void;
}) {
	return (
		<BoardCard
			tone="neutral"
			selected={selected}
			compact={compact}
			onOpen={onOpen}
			testId="working-card"
		>
			{compact ? (
				<CompactWorking session={session} />
			) : (
				<FullWorking session={session} />
			)}
		</BoardCard>
	);
}
