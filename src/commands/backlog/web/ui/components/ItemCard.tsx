import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { itemCardStyles } from "./itemCardStyles";
import { ItemCardMeta } from "./ItemCardMeta";
import { mostRecentOpenSession } from "./mostRecentOpenSession";
import { StatusIcon } from "./StatusIcon";
import { CardActions } from "./CardActions";

export function ItemCard({
	item,
	to,
	socket,
	onReload,
}: {
	item: BacklogItemSummary;
	to: string;
	socket: SessionSocket;
	onReload: () => Promise<void>;
}) {
	const inProgress = item.status === "in-progress";
	return (
		<Box sx={inProgress ? itemCardStyles.inProgressCard : itemCardStyles.card}>
			<StatusIcon status={item.status} />
			<Box sx={itemCardStyles.main}>
				<Link
					component={RouterLink}
					to={to}
					underline="none"
					title={item.name}
					sx={itemCardStyles.stretchedNameLink}
				>
					{item.name}
				</Link>
				<ItemCardMeta
					item={item}
					openSession={mostRecentOpenSession(socket.sessions, item.id)}
					onSelectSession={socket.selectSession}
				/>
			</Box>
			<Box sx={itemCardStyles.actions}>
				<CardActions item={item} onReload={onReload} />
			</Box>
		</Box>
	);
}
