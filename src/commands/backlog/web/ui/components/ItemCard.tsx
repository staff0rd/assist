import { ButtonBase, Chip, Typography } from "@mui/material";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { itemCardStyles } from "./itemCardStyles";
import { JiraKeyLink } from "./JiraKeyLink";
import { StatusIcon } from "./StatusIcon";
import { typeChipColors } from "./typeChipColors";
import { CardActions } from "./CardActions";

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
