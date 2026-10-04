import { Alert, Box, CircularProgress } from "@mui/material";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { ItemCard } from "./ItemCard";
import type { TypeFilterValue } from "./TypeFilter";
import { EmptyState } from "./EmptyState";

type ListBodyProps = {
	loading: boolean;
	error: string | null;
	query: string;
	typeFilter: TypeFilterValue;
	items: BacklogItemSummary[];
	socket: SessionSocket;
	itemPath: (item: BacklogItemSummary) => string;
	onReload: () => Promise<void>;
};

const loadingSx = {
	display: "flex",
	justifyContent: "center",
	py: 6,
} as const;

export function ListBody({
	loading,
	error,
	query,
	typeFilter,
	items,
	socket,
	itemPath,
	onReload,
}: ListBodyProps) {
	if (loading) {
		return (
			<Box sx={loadingSx}>
				<CircularProgress />
			</Box>
		);
	}
	const alert = error && <Alert severity="error">{error}</Alert>;
	if (items.length === 0)
		return alert || <EmptyState query={query} typeFilter={typeFilter} />;
	return (
		<>
			{alert}
			{items.map((item) => (
				<ItemCard
					key={item.id}
					item={item}
					to={itemPath(item)}
					socket={socket}
					onReload={onReload}
				/>
			))}
		</>
	);
}
