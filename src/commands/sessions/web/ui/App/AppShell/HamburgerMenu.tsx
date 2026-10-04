import Menu from "@mui/material/Menu";
import { NodeNameLabel } from "./HamburgerMenu/NodeNameLabel";
import { hamburgerMenuItems } from "./HamburgerMenu/hamburgerMenuItems";
import { HamburgerMenuDialogs } from "./HamburgerMenu/HamburgerMenuDialogs";
import { MenuTriggerButton } from "./HamburgerMenu/MenuTriggerButton";
import { useMenuAnchor } from "./HamburgerMenu/useMenuAnchor";
import { type MenuDialog, useMenuDialog } from "./HamburgerMenu/useMenuDialog";
import { useSelectedPeer } from "./HamburgerMenu/useSelectedPeer";
import { menuTargetLabels } from "./HamburgerMenu/menuTargetLabels";
import type { SessionInfo } from "../../types";

export function HamburgerMenu({
	mode,
	toggle,
	sessions,
	reconnecting,
}: {
	mode: "light" | "dark";
	toggle: () => void;
	sessions: SessionInfo[];
	reconnecting: boolean;
}) {
	const { anchorEl, open, close, openAt, restoreFocus } = useMenuAnchor();
	const { dialog, showDialog, closeDialog } = useMenuDialog();
	const peer = useSelectedPeer();
	const closeAndShow = (next: MenuDialog) => () => {
		close();
		showDialog(next);
	};

	return (
		<>
			<MenuTriggerButton open={open} onOpen={openAt} />
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={close}
				disableRestoreFocus={!restoreFocus}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<NodeNameLabel />
				{hamburgerMenuItems({
					mode,
					...menuTargetLabels(peer),
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
				peer={peer}
				sessions={sessions}
				reconnecting={reconnecting}
				onClose={closeDialog}
			/>
		</>
	);
}
