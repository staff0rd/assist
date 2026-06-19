import Menu from "@mui/material/Menu";
import { useState } from "react";
import { hamburgerMenuItems } from "./hamburgerMenuItems";
import { MenuTriggerButton } from "./MenuTriggerButton";
import type { RestartTarget } from "./postRestart";
import { RestartConfirmDialog } from "./RestartConfirmDialog";
import { UpdateAssistConfirmDialog } from "./UpdateAssistConfirmDialog";
import { useSessionLaunchContext } from "./useSessionLaunchContext";

export function HamburgerMenu({
	mode,
	toggle,
}: {
	mode: "light" | "dark";
	toggle: () => void;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const [pending, setPending] = useState<RestartTarget | null>(null);
	const [updatePending, setUpdatePending] = useState(false);
	const { launchAssist } = useSessionLaunchContext();
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
				{hamburgerMenuItems({
					mode,
					onToggleColorMode: () => {
						toggle();
						setAnchorEl(null);
					},
					onRestart: (target) => {
						setAnchorEl(null);
						setPending(target);
					},
					onUpdate: () => {
						setAnchorEl(null);
						setUpdatePending(true);
					},
				})}
			</Menu>
			{pending && (
				<RestartConfirmDialog
					target={pending}
					onClose={() => setPending(null)}
				/>
			)}
			{updatePending && (
				<UpdateAssistConfirmDialog
					onConfirm={() => launchAssist(["update"])}
					onClose={() => setUpdatePending(false)}
				/>
			)}
		</>
	);
}
