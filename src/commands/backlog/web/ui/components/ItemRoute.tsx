import { Box, CircularProgress } from "@mui/material";
import { useCallback } from "react";
import { useParams } from "react-router";
import { useItem } from "../useItem";
import { ItemDetail } from "./ItemDetail";
import { ItemForm } from "./ItemForm";

const loadingSx = {
	display: "flex",
	justifyContent: "center",
	py: 6,
} as const;

export function ItemRoute({
	mode,
	onReload,
}: {
	mode: "detail" | "edit";
	onReload: () => Promise<void>;
}) {
	const { id } = useParams<{ id: string }>();
	const numId = Number(id);
	const { item, loading, reload } = useItem(numId);

	// Refresh both the open item and the list summary so status/edits made here
	// are reflected when navigating back.
	const handleReload = useCallback(async () => {
		await Promise.all([reload(), onReload()]);
	}, [reload, onReload]);

	if (loading) {
		return (
			<Box sx={loadingSx}>
				<CircularProgress />
			</Box>
		);
	}
	if (!item) return null;

	if (mode === "edit") {
		return (
			<ItemForm
				item={item}
				onReload={handleReload}
				backTo={`/backlog/items/${numId}`}
			/>
		);
	}
	return <ItemDetail item={item} onReload={handleReload} />;
}
