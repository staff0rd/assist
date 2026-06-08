import { Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router";
import { updateItemStatus } from "../api";
import type { BacklogItem } from "../types";
import { useRepoCwd } from "../useRepoCwd";
import { BackButton } from "./BackButton";
import { canPlay } from "./canPlay";
import { DeleteAction } from "./DeleteAction";
import { ItemBody } from "./ItemBody";
import { PlayAction } from "./PlayAction";
import { RefineAction } from "./RefineAction";

type ItemDetailProps = {
	item: BacklogItem;
	onReload: () => Promise<void>;
};

const headerSx = {
	justifyContent: "space-between",
	alignItems: "center",
	mb: 2,
} as const;

function DetailHeader({
	item,
	onDeleted,
}: {
	item: BacklogItem;
	onDeleted: () => Promise<void>;
}) {
	const navigate = useNavigate();
	return (
		<Stack direction="row" sx={headerSx}>
			<BackButton to="/backlog" />
			<Stack direction="row" spacing={1}>
				{canPlay(item) && <PlayAction itemId={item.id} />}
				<RefineAction itemId={item.id} />
				<Button
					variant="contained"
					color="inherit"
					size="small"
					onClick={() => navigate(`/backlog/items/${item.id}/edit`)}
				>
					Edit
				</Button>
				<DeleteAction itemId={item.id} onDeleted={onDeleted} />
			</Stack>
		</Stack>
	);
}

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
	return (
		<Box>
			<DetailHeader item={item} onDeleted={handleDeleted} />
			<ItemBody
				item={item}
				onStatusChange={handleStatusChange}
				onRewind={onReload}
				onCommentDeleted={onReload}
			/>
		</Box>
	);
}
