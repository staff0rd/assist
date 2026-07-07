import type { SubtaskStatus } from "../types";
import { StatusSelect } from "./StatusSelect";

const selectColors: Record<SubtaskStatus, { bg: string; text: string }> = {
	todo: { bg: "action.selected", text: "text.primary" },
	"in-progress": { bg: "warning.main", text: "warning.contrastText" },
	done: { bg: "success.main", text: "success.contrastText" },
};

const allStatuses: SubtaskStatus[] = ["todo", "in-progress", "done"];

export function SubtaskStatusPicker({
	current,
	onStatusChange,
}: {
	current: SubtaskStatus;
	onStatusChange: (status: SubtaskStatus) => void;
}) {
	return (
		<StatusSelect
			value={current}
			options={allStatuses}
			colors={selectColors}
			onChange={onStatusChange}
		/>
	);
}
