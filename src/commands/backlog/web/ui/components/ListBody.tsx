import { Box, CircularProgress } from "@mui/material";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { ItemCard } from "./ItemCard";

type ListBodyProps = {
	loading: boolean;
	query: string;
	items: BacklogItemSummary[];
	socket: SessionSocket;
	onSelect: (item: BacklogItemSummary) => void;
	onReload: () => Promise<void>;
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

export function ListBody({
	loading,
	query,
	items,
	socket,
	onSelect,
	onReload,
}: ListBodyProps) {
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
				<ItemCard
					key={item.id}
					item={item}
					socket={socket}
					onSelect={() => onSelect(item)}
					onReload={onReload}
				/>
			))}
		</>
	);
}
