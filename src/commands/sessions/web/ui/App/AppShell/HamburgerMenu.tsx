import Menu from "@mui/material/Menu";
import { useState } from "react";
import { hamburgerMenuItems } from "./HamburgerMenu/hamburgerMenuItems";
import { HamburgerMenuDialogs } from "./HamburgerMenu/HamburgerMenuDialogs";
import { MenuTriggerButton } from "./HamburgerMenu/MenuTriggerButton";

export function HamburgerMenu({
	mode,
	toggle,
	reconnecting,
}: {
	mode: "light" | "dark";
	toggle: () => void;
	reconnecting: boolean;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [restarting, setRestarting] = useState(false);
	const [updatePending, setUpdatePending] = useState(false);
	const open = Boolean(anchorEl);
	const close = () => setAnchorEl(null);

	return (
		<>
			<MenuTriggerButton open={open} onOpen={setAnchorEl} />
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={close}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				{hamburgerMenuItems({
					mode,
					onToggleColorMode: () => {
						toggle();
						close();
					},
					onRestart: () => {
						close();
						setRestarting(true);
					},
					onUpdate: () => {
						close();
						setUpdatePending(true);
					},
				})}
			</Menu>
			<HamburgerMenuDialogs
				restarting={restarting}
				reconnecting={reconnecting}
				onCloseRestart={() => setRestarting(false)}
				updating={updatePending}
				onCloseUpdate={() => setUpdatePending(false)}
			/>
		</>
	);
}
