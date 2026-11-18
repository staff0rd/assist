import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import type { SessionInfo } from "../../types";
import { BoardGroup } from "./BoardGroup";
import { boardColumnSx } from "./boardColumnSx";
import { groupBoardSessions } from "./groupBoardSessions";
import { NeedsYouGroup } from "./NeedsYouGroup";
import { OtherGroup } from "./OtherGroup";
import { ServersStrip } from "./ServersStrip";
import { WorkingCard } from "./WorkingCard";

export function BoardColumn({
	sessions,
	openId,
	onOpen,
}: {
	sessions: SessionInfo[];
	openId: string | undefined;
	onOpen: (id: string) => void;
}) {
	const { needsYou, working, other, servers } = useMemo(
		() => groupBoardSessions(sessions),
		[sessions],
	);

	return (
		<Box data-testid="card-board" sx={boardColumnSx(openId !== undefined)}>
			<ServersStrip sessions={servers} openId={openId} onOpen={onOpen} />
			<NeedsYouGroup sessions={needsYou} openId={openId} onOpen={onOpen} />
			{working.length > 0 && (
				<BoardGroup title="Working" color="success.main" count={working.length}>
					{working.map((s) => (
						<WorkingCard
							key={s.id}
							session={s}
							selected={s.id === openId}
							onOpen={() => onOpen(s.id)}
						/>
					))}
				</BoardGroup>
			)}
			{needsYou.length === 0 && working.length === 0 && (
				<Typography color="text.secondary">
					Nothing needs you and nothing is working.
				</Typography>
			)}
			<OtherGroup sessions={other} openId={openId} onOpen={onOpen} />
		</Box>
	);
}
