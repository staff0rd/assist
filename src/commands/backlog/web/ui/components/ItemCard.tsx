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

const typeBadgeColors: Record<string, string> = {
	story: "bg-blue-100 text-blue-700",
	bug: "bg-red-100 text-red-700",
};

export function ItemCard({
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
			<span
				className={`text-xs font-medium rounded-full px-2 shrink-0 ${typeBadgeColors[item.type]}`}
			>
				{item.type}
			</span>
			<span className="text-gray-400 text-sm shrink-0">#{item.id}</span>
			<span className="font-medium">{item.name}</span>
		</button>
	);
}
