import Menu from "@mui/material/Menu";
import { NodeNameLabel } from "./HamburgerMenu/NodeNameLabel";
import { hamburgerMenuItems } from "./HamburgerMenu/hamburgerMenuItems";
import { HamburgerMenuDialogs } from "./HamburgerMenu/HamburgerMenuDialogs";
import { MenuTriggerButton } from "./HamburgerMenu/MenuTriggerButton";
import { useMenuAnchor } from "./HamburgerMenu/useMenuAnchor";
import { menuItemHandlers } from "./HamburgerMenu/menuItemHandlers";
import { useMenuActions } from "./HamburgerMenu/useMenuActions";
import { useMenuDialog } from "./HamburgerMenu/useMenuDialog";
import { useSelectedPeer } from "./HamburgerMenu/useSelectedPeer";
import { useLeftoverReport } from "./HamburgerMenu/useLeftoverReport";
import { LeftoversDialog } from "./HamburgerMenu/HamburgerMenuDialogs/LeftoversDialog";
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
	const actions = useMenuActions(peer, sessions, reconnecting);
	const leftovers = useLeftoverReport(peer, open);

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
					leftoverCount: leftovers?.leftovers.length ?? 0,
					...menuItemHandlers(close, showDialog, toggle, actions),
				})}
			</Menu>
			<HamburgerMenuDialogs
				dialog={dialog}
				peer={peer}
				actions={actions}
				onClose={closeDialog}
			/>
			{dialog === "leftovers" && leftovers && (
				<LeftoversDialog report={leftovers} onClose={closeDialog} />
			)}
		</>
	);
}
