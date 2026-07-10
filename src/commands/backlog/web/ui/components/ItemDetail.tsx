import { Box } from "@mui/material";
import { useNavigate } from "react-router";
import { updateItemStatus, updateSubtaskStatus } from "../api";
import type { BacklogItem, SubtaskStatus } from "../types";
import { useRepoCwd } from "../useRepoCwd";
import { ItemBody } from "./ItemBody";
import { PinnedHeader } from "./PinnedHeader";

type ItemDetailProps = {
	item: BacklogItem;
	onReload: () => Promise<void>;
};

export function ItemDetail({ item, onReload }: ItemDetailProps) {
	const navigate = useNavigate();
	const cwd = useRepoCwd();
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
		<Box>
			<PinnedHeader
				item={item}
				onDeleted={handleDeleted}
				onStatusChange={handleStatusChange}
			/>
			<ItemBody
				item={item}
				onRewind={onReload}
				onCommentDeleted={onReload}
				onSubtaskStatusChange={handleSubtaskStatusChange}
			/>
		</Box>
	);
}
