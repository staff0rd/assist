import { ButtonBase, Chip, Typography } from "@mui/material";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { canPlay } from "./canPlay";
import { InProgressChip } from "./InProgressChip";
import { itemCardStyles } from "./itemCardStyles";
import { JiraKeyLink } from "./JiraKeyLink";
import { mostRecentOpenSession } from "./mostRecentOpenSession";
import { PlayAction } from "./PlayAction";
import { StarAction } from "./StarAction";
import { StatusIcon } from "./StatusIcon";
import { typeChipColors } from "./typeChipColors";

function CardSummary({ item }: { item: BacklogItemSummary }) {
	return (
		<>
			<StatusIcon status={item.status} />
			<Chip
				label={item.type}
				size="small"
				color={typeChipColors[item.type]}
				sx={itemCardStyles.chip}
			/>
			<Typography variant="body2" sx={itemCardStyles.id}>
				#{item.id}
			</Typography>
			<Typography sx={itemCardStyles.name}>{item.name}</Typography>
			{item.jiraKey && <JiraKeyLink jiraKey={item.jiraKey} />}
		</>
	);
}

function CardActions({
	item,
	socket,
	onReload,
}: {
	item: BacklogItemSummary;
	socket: SessionSocket;
	onReload: () => Promise<void>;
}) {
	const openSession = mostRecentOpenSession(socket.sessions, item.id);
	return (
		<>
			{item.status === "in-progress" && (
				<InProgressChip
					openSession={openSession}
					onSelectSession={socket.selectSession}
				/>
			)}
			<StarAction
				itemId={item.id}
				starred={item.starred}
				onToggled={onReload}
			/>
			{canPlay(item) && <PlayAction itemId={item.id} compact />}
		</>
	);
}

export function ItemCard({
	item,
	socket,
	onSelect,
	onReload,
}: {
	item: BacklogItemSummary;
	socket: SessionSocket;
	onSelect: () => void;
	onReload: () => Promise<void>;
}) {
	const inProgress = item.status === "in-progress";
	return (
		<ButtonBase
			onClick={onSelect}
			sx={inProgress ? itemCardStyles.inProgressCard : itemCardStyles.card}
		>
			<CardSummary item={item} />
			<CardActions item={item} socket={socket} onReload={onReload} />
		</ButtonBase>
	);
}
