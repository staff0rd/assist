import { MenuItem } from "@mui/material";
import { useShiftSkipMenuItem } from "../../../../sessions/web/ui/useShiftSkipMenuItem";
import { type ClosingStatus, closingLabels } from "./closingLabels";

export function CloseStatusMenuItem({
	status,
	onSelect,
}: {
	status: ClosingStatus;
	onSelect: (status: ClosingStatus, skipConfirm: boolean) => void;
}) {
	const handlers = useShiftSkipMenuItem(
		() => onSelect(status, true),
		() => onSelect(status, false),
		closingLabels[status].action,
	);
	return <MenuItem {...handlers}>{closingLabels[status].action}</MenuItem>;
}
