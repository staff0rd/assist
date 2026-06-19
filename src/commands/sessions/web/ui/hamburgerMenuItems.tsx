import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import { ColorModeIcon } from "./ColorModeIcon";
import { RESTART_ITEMS, type RestartTarget } from "./postRestart";

type HamburgerMenuHandlers = {
	mode: "light" | "dark";
	onToggleColorMode: () => void;
	onRestart: (target: RestartTarget) => void;
	onUpdate: () => void;
};

export function hamburgerMenuItems({
	mode,
	onToggleColorMode,
	onRestart,
	onUpdate,
}: HamburgerMenuHandlers) {
	return [
		<MenuItem key="color-mode" onClick={onToggleColorMode}>
			<ListItemIcon>
				<ColorModeIcon mode={mode} />
			</ListItemIcon>
			<ListItemText>Toggle dark mode</ListItemText>
		</MenuItem>,
		<Divider key="restart-divider" />,
		...RESTART_ITEMS.map((item) => (
			<MenuItem key={item.target} onClick={() => onRestart(item.target)}>
				<ListItemIcon>
					<RestartAltIcon fontSize="small" />
				</ListItemIcon>
				<ListItemText>{item.label}</ListItemText>
			</MenuItem>
		)),
		<MenuItem key="update" onClick={onUpdate}>
			<ListItemIcon>
				<SystemUpdateAltIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText>Update assist</ListItemText>
		</MenuItem>,
	];
}
