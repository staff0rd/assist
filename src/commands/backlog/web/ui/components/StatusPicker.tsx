import { Chip, MenuItem, Select } from "@mui/material";
import type { BacklogItem } from "../types";
import { statusChipColors } from "./typeChipColors";

const selectColors: Record<string, { bg: string; text: string }> = {
	todo: { bg: "action.selected", text: "text.primary" },
	"in-progress": { bg: "warning.main", text: "warning.contrastText" },
	done: { bg: "success.main", text: "success.contrastText" },
	wontdo: { bg: "error.main", text: "error.contrastText" },
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
				color={statusChipColors[current]}
				sx={{
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
				bgcolor: selectColors[current].bg,
				color: selectColors[current].text,
				"& .MuiSelect-select": {
					py: 0.5,
					px: 1.5,
				},
				"& .MuiSelect-icon": {
					color: "inherit",
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
