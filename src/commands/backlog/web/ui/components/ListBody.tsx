import { Box, CircularProgress } from "@mui/material";
import type { SessionSocket } from "../../../../sessions/web/ui/useSessionSocket";
import type { BacklogItemSummary } from "../types";
import { ItemCard } from "./ItemCard";
import type { TypeFilterValue } from "./TypeFilter";

type ListBodyProps = {
	loading: boolean;
	query: string;
	typeFilter: TypeFilterValue;
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

const typeNoun: Record<TypeFilterValue, string> = {
	all: "items",
	story: "stories",
	bug: "bugs",
};

function EmptyState({
	query,
	typeFilter,
}: {
	query: string;
	typeFilter: TypeFilterValue;
}) {
	const noun = typeNoun[typeFilter];
	const message = query.trim()
		? `No ${noun} match your search.`
		: `No ${noun} in the backlog.`;
	return <Box sx={emptySx}>{message}</Box>;
}

export function ListBody({
	loading,
	query,
	typeFilter,
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
	if (items.length === 0)
		return <EmptyState query={query} typeFilter={typeFilter} />;
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
