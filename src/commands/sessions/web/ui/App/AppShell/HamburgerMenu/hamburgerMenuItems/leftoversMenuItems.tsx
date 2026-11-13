import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
import { IconMenuItem } from "./IconMenuItem";

export function leftoversMenuItems(count: number, onClick: () => void) {
	if (count === 0) return [];
	return [
		<IconMenuItem
			key="leftovers"
			icon={<FolderDeleteIcon fontSize="small" color="warning" />}
			label={`${count} leftover workspace${count === 1 ? "" : "s"}`}
			onClick={onClick}
		/>,
	];
}
