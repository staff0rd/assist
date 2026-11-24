import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router";
import type {
	SessionInfo,
	SessionSocket,
} from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { itemCardStyles } from "./itemCardStyles";
import { ItemCardMeta } from "./ItemCardMeta";

export function ItemCardMain({
	item,
	to,
	openSession,
	onSelectSession,
}: {
	item: BacklogItemSummary;
	to: string;
	openSession: SessionInfo | undefined;
	onSelectSession: SessionSocket["selectSession"];
}) {
	return (
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
				onSelectSession={onSelectSession}
			/>
		</Box>
	);
}
