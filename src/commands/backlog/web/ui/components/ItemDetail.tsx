import { Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router";
import { updateItemStatus } from "../api";
import type { BacklogItem } from "../types";
import { BackButton } from "./BackButton";
import { DeleteAction } from "./DeleteAction";
import { ItemBody } from "./ItemBody";

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
	itemId,
	onDeleted,
}: {
	itemId: number;
	onDeleted: () => Promise<void>;
}) {
	const navigate = useNavigate();
	return (
		<Stack direction="row" sx={headerSx}>
			<BackButton to="/backlog" />
			<Stack direction="row" spacing={1}>
				<Button
					variant="contained"
					color="inherit"
					size="small"
					onClick={() => navigate(`/backlog/items/${itemId}/edit`)}
				>
					Edit
				</Button>
				<DeleteAction itemId={itemId} onDeleted={onDeleted} />
			</Stack>
		</Stack>
	);
}

export function ItemDetail({ item, onReload }: ItemDetailProps) {
	const navigate = useNavigate();
	const handleDeleted = async () => {
		await onReload();
		navigate("/backlog");
	};
	const handleStatusChange = async (status: BacklogItem["status"]) => {
		await updateItemStatus(item.id, status);
		await onReload();
	};
	return (
		<Box>
			<DetailHeader itemId={item.id} onDeleted={handleDeleted} />
			<ItemBody
				item={item}
				onStatusChange={handleStatusChange}
				onRewind={onReload}
			/>
		</Box>
	);
}
