import { Box, Link } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { draggingCardClass } from "./draggingCardClass";
import { itemCardStyles } from "./itemCardStyles";
import { itemCardSx } from "./itemCardSx";
import { ItemCardMeta } from "./ItemCardMeta";
import { mostRecentOpenSession } from "./mostRecentOpenSession";
import { StatusIcon } from "./StatusIcon";
import { CardActions } from "./CardActions";

export type ItemCardProps = {
	item: BacklogItemSummary;
	to: string;
	socket: SessionSocket;
	onReload: () => Promise<void>;
};

export function ItemCard({
	item,
	to,
	socket,
	onReload,
	grip,
	dragging,
}: ItemCardProps & { grip?: ReactNode; dragging?: boolean }) {
	const openSession = mostRecentOpenSession(socket.sessions, item.id);
	const inProgress = item.status === "in-progress";
	const running = inProgress && openSession?.status === "running";
	return (
		<Box
			sx={itemCardSx(inProgress, running)}
			className={dragging ? draggingCardClass : undefined}
		>
			<Box sx={itemCardStyles.leading}>
				{grip}
				<StatusIcon status={item.status} />
			</Box>
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
					openSession={openSession}
					onSelectSession={socket.selectSession}
				/>
			</Box>
			<Box sx={itemCardStyles.actions}>
				<CardActions item={item} onReload={onReload} />
			</Box>
		</Box>
	);
}
