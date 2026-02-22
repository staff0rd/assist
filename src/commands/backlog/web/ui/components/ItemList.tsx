import type { BacklogItem } from "../types";

const statusIcons: Record<string, string> = {
	todo: "\u25cb",
	"in-progress": "\u25d4",
	done: "\u25cf",
};

const statusColors: Record<string, string> = {
	todo: "text-gray-400",
	"in-progress": "text-amber-500",
	done: "text-green-500",
};

type ItemListProps = {
	items: BacklogItem[];
	onSelect: (id: number) => void;
	onAdd: () => void;
};

function ItemCard({
	item,
	onSelect,
}: {
	item: BacklogItem;
	onSelect: () => void;
}) {
	return (
		<button
			type="button"
			className="bg-white rounded-lg p-4 mb-2 cursor-pointer border border-gray-200 hover:shadow-md transition-shadow flex items-center gap-3 text-left w-full font-[inherit]"
			onClick={onSelect}
		>
			<span className={`text-lg shrink-0 ${statusColors[item.status]}`}>
				{statusIcons[item.status]}
			</span>
			<span className="text-gray-400 text-sm shrink-0">#{item.id}</span>
			<span className="font-medium">{item.name}</span>
		</button>
	);
}

export function ItemList({ items, onSelect, onAdd }: ItemListProps) {
	return (
		<>
			<header className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-semibold">Backlog</h1>
				<button
					type="button"
					className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
					onClick={onAdd}
				>
					+ Add Item
				</button>
			</header>
			{items.length === 0 ? (
				<div className="text-center text-gray-400 py-12 px-4">
					No items in the backlog.
				</div>
			) : (
				items.map((item) => (
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
