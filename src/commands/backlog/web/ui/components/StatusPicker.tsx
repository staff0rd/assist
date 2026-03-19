import type { BacklogItem } from "../types";

const badgeColors: Record<string, string> = {
	todo: "bg-gray-100 text-gray-500",
	"in-progress": "bg-amber-100 text-amber-800",
	done: "bg-green-100 text-green-800",
};

const allStatuses: BacklogItem["status"][] = ["todo", "in-progress", "done"];

export function StatusPicker({
	current,
	onStatusChange,
}: {
	current: BacklogItem["status"];
	onStatusChange?: (status: BacklogItem["status"]) => void;
}) {
	if (!onStatusChange) {
		return (
			<span
				className={`inline-block rounded-full px-2.5 text-xs font-medium ${badgeColors[current]}`}
			>
				{current}
			</span>
		);
	}
	return (
		<select
			value={current}
			onChange={(e) => onStatusChange(e.target.value as BacklogItem["status"])}
			className={`rounded-full px-2.5 text-xs font-medium cursor-pointer ${badgeColors[current]}`}
		>
			{allStatuses.map((s) => (
				<option key={s} value={s}>
					{s}
				</option>
			))}
		</select>
	);
}
