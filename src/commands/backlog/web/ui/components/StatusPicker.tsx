import { Chip } from "@mui/material";
import type { BacklogItem } from "../types";
import { StatusSelect } from "./StatusSelect";
import { statusChipColors } from "./typeChipColors";

const selectColors: Record<
	BacklogItem["status"],
	{ bg: string; text: string }
> = {
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
		<StatusSelect
			value={current}
			options={allStatuses}
			colors={selectColors}
			onChange={onStatusChange}
		/>
	);
}
