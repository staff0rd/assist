import Menu from "@mui/material/Menu";
import { useState } from "react";
import { NodeNameLabel } from "./HamburgerMenu/NodeNameLabel";
import { hamburgerMenuItems } from "./HamburgerMenu/hamburgerMenuItems";
import { HamburgerMenuDialogs } from "./HamburgerMenu/HamburgerMenuDialogs";
import { MenuTriggerButton } from "./HamburgerMenu/MenuTriggerButton";
import { type MenuDialog, useMenuDialog } from "./HamburgerMenu/useMenuDialog";

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
	const { dialog, showDialog, closeDialog } = useMenuDialog();
	const open = Boolean(anchorEl);
	const close = () => setAnchorEl(null);
	const closeAndShow = (next: MenuDialog) => () => {
		close();
		showDialog(next);
	};

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
				<NodeNameLabel />
				{hamburgerMenuItems({
					mode,
					onToggleColorMode: () => {
						toggle();
						close();
					},
					onShowShortcuts: closeAndShow("shortcuts"),
					onRestart: closeAndShow("restart"),
					onUpdate: closeAndShow("update"),
				})}
			</Menu>
			<HamburgerMenuDialogs
				dialog={dialog}
				reconnecting={reconnecting}
				onClose={closeDialog}
			/>
		</>
	);
}
