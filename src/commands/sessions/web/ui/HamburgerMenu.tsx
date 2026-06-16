import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { ColorModeIcon } from "./ColorModeIcon";
import { MenuTriggerButton } from "./MenuTriggerButton";
import { RESTART_ITEMS, type RestartTarget } from "./postRestart";
import { RestartConfirmDialog } from "./RestartConfirmDialog";

function renderRestartItems(onPick: (target: RestartTarget) => void) {
	return RESTART_ITEMS.map((item) => (
		<MenuItem key={item.target} onClick={() => onPick(item.target)}>
			<ListItemIcon>
				<RestartAltIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText>{item.label}</ListItemText>
		</MenuItem>
	));
}

export function HamburgerMenu({
	mode,
	toggle,
}: {
	mode: "light" | "dark";
	toggle: () => void;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [pending, setPending] = useState<RestartTarget | null>(null);
	const open = Boolean(anchorEl);

	return (
		<>
			<MenuTriggerButton open={open} onOpen={setAnchorEl} />
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<MenuItem
					onClick={() => {
						toggle();
						setAnchorEl(null);
					}}
				>
					<ListItemIcon>
						<ColorModeIcon mode={mode} />
					</ListItemIcon>
					<ListItemText>Toggle dark mode</ListItemText>
				</MenuItem>
				<Divider />
				{renderRestartItems((target) => {
					setAnchorEl(null);
					setPending(target);
				})}
			</Menu>
			{pending && (
				<RestartConfirmDialog
					target={pending}
					onClose={() => setPending(null)}
				/>
			)}
		</>
	);
}
