import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import { ColorModeIcon } from "./hamburgerMenuItems/ColorModeIcon";
import { RESTART_ITEM } from "../postRestart";
import { RenderHudMenuItem } from "./hamburgerMenuItems/RenderHudMenuItem";

type HamburgerMenuHandlers = {
	mode: "light" | "dark";
	onToggleColorMode: () => void;
	onRestart: () => void;
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
		<RenderHudMenuItem key="render-hud" />,
		<Divider key="restart-divider" />,
		<MenuItem key="restart" onClick={onRestart}>
			<ListItemIcon>
				<RestartAltIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText>{RESTART_ITEM.label}</ListItemText>
		</MenuItem>,
		<MenuItem key="update" onClick={onUpdate}>
			<ListItemIcon>
				<SystemUpdateAltIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText>Update assist</ListItemText>
		</MenuItem>,
	];
}
