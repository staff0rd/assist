import { Paper, Typography } from "@mui/material";
import type { BacklogItem, SubtaskStatus } from "../types";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { ItemDescription } from "./ItemDescription";
import { ItemMeta } from "./ItemMeta";
import { ItemRelations } from "./ItemRelations";

export function ItemBody({
	item,
	onStatusChange,
	onRewind,
	onCommentDeleted,
	onSubtaskStatusChange,
}: {
	item: BacklogItem;
	onStatusChange?: (status: BacklogItem["status"]) => void;
	onRewind?: () => Promise<void>;
	onCommentDeleted?: () => Promise<void>;
	onSubtaskStatusChange?: (idx: number, status: SubtaskStatus) => void;
}) {
	return (
		<Paper variant="outlined" sx={{ p: 3 }}>
			<Typography variant="h5" component="h2">
				{item.name}
			</Typography>
			<ItemMeta item={item} onStatusChange={onStatusChange} />
			<ItemDescription description={item.description} />
			<AcceptanceCriteriaList criteria={item.acceptanceCriteria} />
			<ItemRelations
				item={item}
				onRewind={onRewind}
				onCommentDeleted={onCommentDeleted}
				onSubtaskStatusChange={onSubtaskStatusChange}
			/>
		</Paper>
	);
}
