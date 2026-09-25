import SpeedIcon from "@mui/icons-material/Speed";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import { setRenderHudEnabled } from "../../../../renderCounters";
import { useRenderHudEnabled } from "../../useRenderHudEnabled";

export function RenderHudMenuItem() {
	const enabled = useRenderHudEnabled();

	return (
		<MenuItem onClick={() => setRenderHudEnabled(!enabled)}>
			<ListItemIcon>
				<SpeedIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText>
				{enabled ? "Hide render HUD" : "Show render HUD"}
			</ListItemText>
		</MenuItem>
	);
}
