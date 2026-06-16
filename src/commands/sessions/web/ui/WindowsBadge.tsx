import Tooltip from "@mui/material/Tooltip";
import { WindowsIcon } from "./WindowsIcon";

export function WindowsBadge() {
	return (
		<Tooltip title="Windows">
			<WindowsIcon sx={{ fontSize: 13, color: "info.main" }} />
		</Tooltip>
	);
}
