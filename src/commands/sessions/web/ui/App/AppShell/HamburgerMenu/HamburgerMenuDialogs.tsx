import { ShortcutsDialog } from "./HamburgerMenuDialogs/ShortcutsDialog";
import { RestartConfirmDialog } from "./HamburgerMenuDialogs/RestartConfirmDialog";
import { UpdateAssistConfirmDialog } from "./HamburgerMenuDialogs/UpdateAssistConfirmDialog";
import type { MenuDialog } from "./useMenuDialog";
import { useSessionLaunchContext } from "../../../useSessionLaunchContext";

export function HamburgerMenuDialogs({
	dialog,
	reconnecting,
	onClose,
}: {
	dialog: MenuDialog | null;
	reconnecting: boolean;
	onClose: () => void;
}) {
	const { launchAssist, armUpdateReload } = useSessionLaunchContext();

	return (
		<>
			{dialog === "shortcuts" && <ShortcutsDialog onClose={onClose} />}
			{dialog === "restart" && (
				<RestartConfirmDialog reconnecting={reconnecting} onClose={onClose} />
			)}
			{dialog === "update" && (
				<UpdateAssistConfirmDialog
					onConfirm={() => {
						armUpdateReload();
						launchAssist(["update"]);
					}}
					onClose={onClose}
				/>
			)}
		</>
	);
}
