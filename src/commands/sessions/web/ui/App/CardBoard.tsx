import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import type { SessionInfo } from "../types";
import { BoardGroup } from "./CardBoard/BoardGroup";
import { groupBoardSessions } from "./CardBoard/groupBoardSessions";
import { NeedsYouCard } from "./CardBoard/NeedsYouCard";
import { WorkingCard } from "./CardBoard/WorkingCard";
import { useNowSeconds } from "./useNowSeconds";

export function CardBoard({ sessions }: { sessions: SessionInfo[] }) {
	const { needsYou, working } = useMemo(
		() => groupBoardSessions(sessions),
		[sessions],
	);
	const nowMs = useNowSeconds(30_000) * 1000;

	return (
		<Box
			data-testid="card-board"
			sx={{
				flex: 1,
				overflow: "auto",
				px: 4,
				py: 3.5,
				display: "flex",
				flexDirection: "column",
				gap: 4,
				bgcolor: "background.default",
			}}
		>
			{needsYou.length > 0 && (
				<BoardGroup
					title="Needs you"
					color="warning.main"
					count={needsYou.length}
				>
					{needsYou.map((s) => (
						<NeedsYouCard key={s.id} session={s} nowMs={nowMs} />
					))}
				</BoardGroup>
			)}
			{working.length > 0 && (
				<BoardGroup title="Working" color="success.main" count={working.length}>
					{working.map((s) => (
						<WorkingCard key={s.id} session={s} />
					))}
				</BoardGroup>
			)}
			{needsYou.length === 0 && working.length === 0 && (
				<Typography color="text.secondary">
					Nothing needs you and nothing is working.
				</Typography>
			)}
		</Box>
	);
}
