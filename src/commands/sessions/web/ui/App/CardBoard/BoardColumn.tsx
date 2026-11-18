import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { SessionInfo } from "../../types";
import { boardColumnSx } from "./boardColumnSx";
import { PhoneRepoChips } from "../../PhoneShell/PhoneRepoChips";
import type { BoardLayout } from "./boardLayout";
import { CardGroup } from "./CardGroup";
import { NeedsYouCard } from "./NeedsYouCard";
import { OtherGroup } from "./OtherGroup";
import { ServersStrip } from "./ServersStrip";
import { useBoardGroups } from "./useBoardGroups";
import { WorkingCard } from "./WorkingCard";

const repoChipsSx = { display: "flex", flexWrap: "wrap", gap: 1 } as const;

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
	const { filter, groups } = useBoardGroups(sessions);
	const { needsYou, working, other, servers } = groups;

	return (
		<Box data-testid="card-board" sx={boardColumnSx(layout)}>
			<PhoneRepoChips
				chips={filter.chips}
				total={sessions.length}
				selected={filter.repo}
				onSelect={filter.selectRepo}
				sx={repoChipsSx}
			/>
			<ServersStrip sessions={servers} openId={openId} onOpen={onOpen} />
			<CardGroup
				title="Needs you"
				color="warning.main"
				card={NeedsYouCard}
				sessions={needsYou}
				openId={openId}
				onOpen={onOpen}
			/>
			<CardGroup
				title="Working"
				color="success.main"
				card={WorkingCard}
				sessions={working}
				openId={openId}
				onOpen={onOpen}
			/>
			{needsYou.length === 0 && working.length === 0 && (
				<Typography color="text.secondary">
					Nothing needs you and nothing is working.
				</Typography>
			)}
			<OtherGroup sessions={other} openId={openId} onOpen={onOpen} />
		</Box>
	);
}
