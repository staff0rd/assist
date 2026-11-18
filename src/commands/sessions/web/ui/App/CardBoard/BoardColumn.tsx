import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useMemo } from "react";
import type { SessionInfo } from "../../types";
import { boardColumnSx } from "./boardColumnSx";
import type { BoardLayout } from "./boardLayout";
import { groupBoardSessions } from "./groupBoardSessions";
import { NeedsYouGroup } from "./NeedsYouGroup";
import { OtherGroup } from "./OtherGroup";
import { ServersStrip } from "./ServersStrip";
import { WorkingGroup } from "./WorkingGroup";

export function BoardColumn({
	sessions,
	openId,
	layout,
	onOpen,
}: {
	sessions: SessionInfo[];
	openId: string | undefined;
	layout: BoardLayout;
	onOpen: (id: string) => void;
}) {
	const { needsYou, working, other, servers } = useMemo(
		() => groupBoardSessions(sessions),
		[sessions],
	);
	const compact = layout === "compact";

	return (
		<Box data-testid="card-board" sx={boardColumnSx(layout)}>
			<ServersStrip sessions={servers} openId={openId} onOpen={onOpen} />
			<NeedsYouGroup
				sessions={needsYou}
				openId={openId}
				compact={compact}
				onOpen={onOpen}
			/>
			<WorkingGroup
				sessions={working}
				openId={openId}
				compact={compact}
				onOpen={onOpen}
			/>
			{needsYou.length === 0 && working.length === 0 && (
				<Typography color="text.secondary">
					Nothing needs you and nothing is working.
				</Typography>
			)}
			<OtherGroup
				sessions={other}
				openId={openId}
				compact={compact}
				onOpen={onOpen}
			/>
		</Box>
	);
}
