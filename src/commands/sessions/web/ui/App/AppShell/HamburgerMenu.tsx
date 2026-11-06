import Menu from "@mui/material/Menu";
import { NodeNameLabel } from "./HamburgerMenu/NodeNameLabel";
import { hamburgerMenuItems } from "./HamburgerMenu/hamburgerMenuItems";
import { HamburgerMenuDialogs } from "./HamburgerMenu/HamburgerMenuDialogs";
import { MenuTriggerButton } from "./HamburgerMenu/MenuTriggerButton";
import { useMenuAnchor } from "./HamburgerMenu/useMenuAnchor";
import { menuItemHandlers } from "./HamburgerMenu/menuItemHandlers";
import { useMenuDialog } from "./HamburgerMenu/useMenuDialog";
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
					...menuItemHandlers(close, showDialog, toggle),
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
