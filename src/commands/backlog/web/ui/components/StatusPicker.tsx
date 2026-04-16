import { Chip, MenuItem, Select } from "@mui/material";
import type { BacklogItem } from "../types";

const badgeColors: Record<string, { bg: string; text: string }> = {
	todo: { bg: "action.selected", text: "text.secondary" },
	"in-progress": { bg: "warning.light", text: "warning.dark" },
	done: { bg: "success.light", text: "success.dark" },
	wontdo: { bg: "error.light", text: "error.dark" },
};

const allStatuses: BacklogItem["status"][] = [
	"todo",
	"in-progress",
	"done",
	"wontdo",
];

export function StatusPicker({
	current,
	onStatusChange,
}: {
	current: BacklogItem["status"];
	onStatusChange?: (status: BacklogItem["status"]) => void;
}) {
	if (!onStatusChange) {
		return (
			<Chip
				label={current}
				size="small"
				sx={{
					bgcolor: badgeColors[current].bg,
					color: badgeColors[current].text,
					fontWeight: 500,
					fontSize: "0.75rem",
				}}
			/>
		);
	}
	return (
		<Select
			value={current}
			onChange={(e) => onStatusChange(e.target.value as BacklogItem["status"])}
			size="small"
			sx={{
				fontSize: "0.75rem",
				fontWeight: 500,
				borderRadius: 4,
				bgcolor: badgeColors[current].bg,
				color: badgeColors[current].text,
				"& .MuiSelect-select": {
					py: 0.5,
					px: 1.5,
				},
			}}
		>
			{allStatuses.map((s) => (
				<MenuItem key={s} value={s}>
					{s}
				</MenuItem>
			))}
		</Select>
	);
}
