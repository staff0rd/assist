import { Box, ButtonBase, Typography } from "@mui/material";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { itemCardStyles } from "./itemCardStyles";
import { ItemCardMeta } from "./ItemCardMeta";
import { mostRecentOpenSession } from "./mostRecentOpenSession";
import { StatusIcon } from "./StatusIcon";
import { CardActions } from "./CardActions";

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
			<StatusIcon status={item.status} />
			<Box sx={itemCardStyles.main}>
				<Typography sx={itemCardStyles.name} title={item.name}>
					{item.name}
				</Typography>
				<ItemCardMeta
					item={item}
					openSession={mostRecentOpenSession(socket.sessions, item.id)}
					onSelectSession={socket.selectSession}
				/>
			</Box>
			<Box sx={itemCardStyles.actions}>
				<CardActions item={item} onReload={onReload} />
			</Box>
		</ButtonBase>
	);
}
