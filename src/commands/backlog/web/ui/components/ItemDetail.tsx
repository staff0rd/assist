import { Box } from "@mui/material";
import { useNavigate } from "react-router";
import { countRender } from "../../../../sessions/web/ui/renderCounters";
import { updateItemStatus, updateSubtaskStatus } from "../api";
import type { BacklogItem, SubtaskStatus } from "../types";
import { useRepoCwd } from "../useRepoCwd";
import { ItemBody } from "./ItemBody";
import { itemDetailLayout } from "./itemDetailLayout";
import { ItemNavigator } from "./ItemNavigator";
import { PinnedHeader } from "./PinnedHeader";
import { usePinnedHeaderHeight } from "./usePinnedHeaderHeight";

type ItemDetailProps = {
	item: BacklogItem;
	onReload: () => Promise<void>;
};

export function ItemDetail({ item, onReload }: ItemDetailProps) {
	const navigate = useNavigate();
	const cwd = useRepoCwd();
	const { headerRef, headerHeight, style } = usePinnedHeaderHeight();
	countRender("ItemDetail");
	const handleDeleted = async () => {
		await onReload();
		navigate("/backlog");
	};
	const handleStatusChange = async (status: BacklogItem["status"]) => {
		await updateItemStatus(item.id, status, cwd);
		await onReload();
	};
	const handleSubtaskStatusChange = async (
		idx: number,
		status: SubtaskStatus,
	) => {
		await updateSubtaskStatus(item.id, idx, status, cwd);
		await onReload();
	};
	return (
		<Box style={style}>
			<PinnedHeader
				ref={headerRef}
				item={item}
				onDeleted={handleDeleted}
				onStatusChange={handleStatusChange}
			/>
			<Box sx={itemDetailLayout.containerSx}>
				<Box sx={itemDetailLayout.columnsSx}>
					<ItemBody
						item={item}
						onRewind={onReload}
						onCommentDeleted={onReload}
						onSubtaskStatusChange={handleSubtaskStatusChange}
					/>
					<ItemNavigator item={item} headerHeight={headerHeight} />
				</Box>
			</Box>
		</Box>
	);
}
