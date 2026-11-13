import KeyboardIcon from "@mui/icons-material/Keyboard";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import Divider from "@mui/material/Divider";
import { ColorModeIcon } from "./hamburgerMenuItems/ColorModeIcon";
import { FirefoxExtensionMenuItem } from "./hamburgerMenuItems/FirefoxExtensionMenuItem";
import { IconMenuItem } from "./hamburgerMenuItems/IconMenuItem";
import { leftoversMenuItems } from "./hamburgerMenuItems/leftoversMenuItems";
import { navigationMenuItems } from "./hamburgerMenuItems/navigationMenuItems";
import { RenderHudMenuItem } from "./hamburgerMenuItems/RenderHudMenuItem";
import {
	type ShiftSkipMenuAction,
	ShiftSkipMenuItem,
} from "./hamburgerMenuItems/ShiftSkipMenuItem";
import { TestflightMenuItem } from "./hamburgerMenuItems/TestflightMenuItem";

type HamburgerMenuHandlers = {
	mode: "light" | "dark";
	restartLabel: string;
	updateLabel: string;
	leftoverCount: number;
	onToggleColorMode: () => void;
	onShowShortcuts: () => void;
	onNavigate: () => void;
	onFirefoxExtension: () => void;
	onTestflight: () => void;
	onLeftovers: () => void;
	onRestart: ShiftSkipMenuAction;
	onUpdate: ShiftSkipMenuAction;
};

export function hamburgerMenuItems(handlers: HamburgerMenuHandlers) {
	return [
		<IconMenuItem
			key="color-mode"
			icon={<ColorModeIcon mode={handlers.mode} />}
			label="Toggle dark mode"
			onClick={handlers.onToggleColorMode}
		/>,
		<RenderHudMenuItem key="render-hud" />,
		<IconMenuItem
			key="shortcuts"
			icon={<KeyboardIcon fontSize="small" />}
			label="Keyboard shortcuts"
			onClick={handlers.onShowShortcuts}
		/>,
		...navigationMenuItems(handlers.onNavigate),
		<FirefoxExtensionMenuItem
			key="firefox-extension"
			onClose={handlers.onFirefoxExtension}
		/>,
		<TestflightMenuItem key="testflight" onClick={handlers.onTestflight} />,
		...leftoversMenuItems(handlers.leftoverCount, handlers.onLeftovers),
		<Divider key="restart-divider" />,
		<ShiftSkipMenuItem
			key="restart"
			icon={<RestartAltIcon fontSize="small" />}
			label={handlers.restartLabel}
			action={handlers.onRestart}
		/>,
		<ShiftSkipMenuItem
			key="update"
			icon={<SystemUpdateAltIcon fontSize="small" />}
			label={handlers.updateLabel}
			action={handlers.onUpdate}
		/>,
	];
}
