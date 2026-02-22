import { useAtomValue } from "jotai";
import { showCompletedAtom } from "../showCompletedAtom";
import type { BacklogItem } from "../types";
import { CompletedToggle } from "./CompletedToggle";
import { ItemCard } from "./ItemCard";

type ItemListProps = {
	items: BacklogItem[];
	onSelect: (id: number) => void;
	onAdd: () => void;
};

export function ItemList({ items, onSelect, onAdd }: ItemListProps) {
	const showCompleted = useAtomValue(showCompletedAtom);
	const filtered = showCompleted
		? items
		: items.filter((item) => item.status !== "done");

	return (
		<>
			<header className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold">Backlog</h1>
				<div className="flex items-center gap-4">
					<CompletedToggle />
					<button
						type="button"
						className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
						onClick={onAdd}
					>
						+ Add Item
					</button>
				</div>
			</header>
			{filtered.length === 0 ? (
				<div className="text-center text-gray-400 py-12 px-4">
					No items in the backlog.
				</div>
			) : (
				filtered.map((item) => (
					<ItemCard
						key={item.id}
						item={item}
						onSelect={() => onSelect(item.id)}
					/>
				))
			)}
		</>
	);
}
