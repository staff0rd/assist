import { useAtomValue } from "jotai";
import { useNavigate } from "react-router";
import { showCompletedAtom } from "../showCompletedAtom";
import type { BacklogItem } from "../types";
import { useSearchItems } from "../useSearchItems";
import { CompletedToggle } from "./CompletedToggle";
import { ItemCard } from "./ItemCard";
import { SearchInput } from "./SearchInput";

type ItemListProps = {
	items: BacklogItem[];
};

function filterVisible(items: BacklogItem[], showCompleted: boolean) {
	if (showCompleted) return items;
	return items.filter(
		(item) => item.status !== "done" && item.status !== "wontdo",
	);
}

export function ItemList({ items }: ItemListProps) {
	const navigate = useNavigate();
	const showCompleted = useAtomValue(showCompletedAtom);
	const { query, setQuery, results } = useSearchItems();
	const filtered = filterVisible(results ?? items, showCompleted);

	return (
		<>
			<header className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold">Backlog</h1>
				<div className="flex items-center gap-4">
					<CompletedToggle />
					<button
						type="button"
						className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
						onClick={() => navigate("/add")}
					>
						+ Add Item
					</button>
				</div>
			</header>
			<SearchInput value={query} onChange={setQuery} />
			{filtered.length === 0 ? (
				<div className="text-center text-gray-400 py-12 px-4">
					{query.trim()
						? "No items match your search."
						: "No items in the backlog."}
				</div>
			) : (
				filtered.map((item) => (
					<ItemCard
						key={item.id}
						item={item}
						onSelect={() => navigate(`/items/${item.id}`)}
					/>
				))
			)}
		</>
	);
}
