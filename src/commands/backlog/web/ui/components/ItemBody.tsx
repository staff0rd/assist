import { Box } from "@mui/material";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { ItemDescription } from "./ItemDescription";
import { ItemRelations, type ItemRelationsProps } from "./ItemRelations";

export function ItemBody({
	item,
	onRewind,
	onCommentDeleted,
	onSubtaskStatusChange,
}: ItemRelationsProps) {
	return (
		<Box sx={{ pt: 2 }}>
			<ItemDescription description={item.description} />
			<AcceptanceCriteriaList criteria={item.acceptanceCriteria} />
			<ItemRelations
				item={item}
				onRewind={onRewind}
				onCommentDeleted={onCommentDeleted}
				onSubtaskStatusChange={onSubtaskStatusChange}
			/>
		</Box>
	);
}
