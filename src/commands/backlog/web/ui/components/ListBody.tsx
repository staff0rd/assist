import { Box, CircularProgress } from "@mui/material";
import type { BacklogItemSummary } from "../types";
import { ItemCard } from "./ItemCard";

type ListBodyProps = {
	loading: boolean;
	query: string;
	items: BacklogItemSummary[];
	onSelect: (item: BacklogItemSummary) => void;
};

const loadingSx = {
	display: "flex",
	justifyContent: "center",
	py: 6,
} as const;
const emptySx = {
	textAlign: "center",
	color: "text.disabled",
	py: 6,
	px: 2,
} as const;

function EmptyState({ query }: { query: string }) {
	const message = query.trim()
		? "No items match your search."
		: "No items in the backlog.";
	return <Box sx={emptySx}>{message}</Box>;
}

export function ListBody({ loading, query, items, onSelect }: ListBodyProps) {
	if (loading) {
		return (
			<Box sx={loadingSx}>
				<CircularProgress />
			</Box>
		);
	}
	if (items.length === 0) return <EmptyState query={query} />;
	return (
		<>
			{items.map((item) => (
				<ItemCard key={item.id} item={item} onSelect={() => onSelect(item)} />
			))}
		</>
	);
}
