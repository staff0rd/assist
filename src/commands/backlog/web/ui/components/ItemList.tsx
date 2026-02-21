import type { BacklogItem } from "../types";

const statusIcons: Record<string, string> = {
	todo: "\u25cb",
	"in-progress": "\u25d4",
	done: "\u25cf",
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
			className="card"
			style={{ textAlign: "left", width: "100%", font: "inherit" }}
			onClick={onSelect}
		>
			<span className={`status-icon status-${item.status}`}>
				{statusIcons[item.status]}
			</span>
			<span className="card-id">#{item.id}</span>
			<span className="card-name">{item.name}</span>
		</button>
	);
}

export function ItemList({ items, onSelect, onAdd }: ItemListProps) {
	return (
		<>
			<header>
				<h1>Backlog</h1>
				<button type="button" className="btn-primary" onClick={onAdd}>
					+ Add Item
				</button>
			</header>
			{items.length === 0 ? (
				<div className="empty">No items in the backlog.</div>
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
