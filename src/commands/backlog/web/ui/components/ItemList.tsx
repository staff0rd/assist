import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router";
import type { BacklogItem } from "../types";
import { useSearchItems } from "../useSearchItems";
import { useShowCompleted } from "../useShowCompleted";
import { CompletedToggle } from "./CompletedToggle";
import { ItemCard } from "./ItemCard";
import { SearchInput } from "./SearchInput";

type ItemListProps = {
	items: BacklogItem[];
};

const headerSx = {
	justifyContent: "space-between",
	alignItems: "center",
	mb: 3,
} as const;
const emptySx = {
	textAlign: "center",
	color: "text.disabled",
	py: 6,
	px: 2,
} as const;

function filterVisible(items: BacklogItem[], showCompleted: boolean) {
	if (showCompleted) return items;
	return items.filter(
		(item) => item.status !== "done" && item.status !== "wontdo",
	);
}

const titleSx = { fontWeight: 600 } as const;
const actionsSx = { alignItems: "center" } as const;

function EmptyState({ query }: { query: string }) {
	const message = query.trim()
		? "No items match your search."
		: "No items in the backlog.";
	return <Box sx={emptySx}>{message}</Box>;
}

function Header({ onAdd }: { onAdd: () => void }) {
	return (
		<Stack direction="row" sx={headerSx}>
			<Typography variant="h5" sx={titleSx}>
				Backlog
			</Typography>
			<Stack direction="row" spacing={2} sx={actionsSx}>
				<CompletedToggle />
				<Button variant="contained" size="small" onClick={onAdd}>
					+ Add Item
				</Button>
			</Stack>
		</Stack>
	);
}

export function ItemList({ items }: ItemListProps) {
	const navigate = useNavigate();
	const [showCompleted] = useShowCompleted();
	const { query, setQuery, results } = useSearchItems();
	const filtered = filterVisible(results ?? items, showCompleted);

	return (
		<>
			<Header onAdd={() => navigate("/backlog/add")} />
			<SearchInput value={query} onChange={setQuery} />
			{filtered.length === 0 ? (
				<EmptyState query={query} />
			) : (
				filtered.map((item) => (
					<ItemCard
						key={item.id}
						item={item}
						onSelect={() => navigate(`/backlog/items/${item.id}`)}
					/>
				))
			)}
		</>
	);
}
