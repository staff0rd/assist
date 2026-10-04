import { PeerRestartConfirmDialog } from "./HamburgerMenuDialogs/PeerRestartConfirmDialog";
import { PeerRestartSnackbars } from "./HamburgerMenuDialogs/PeerRestartSnackbars";
import { ShortcutsDialog } from "./HamburgerMenuDialogs/ShortcutsDialog";
import { RestartConfirmDialog } from "./HamburgerMenuDialogs/RestartConfirmDialog";
import { UpdateAssistConfirmDialog } from "./HamburgerMenuDialogs/UpdateAssistConfirmDialog";
import { usePeerRestart } from "./HamburgerMenuDialogs/usePeerRestart";
import type { MenuDialog } from "./useMenuDialog";
import { useSessionLaunchContext } from "../../../useSessionLaunchContext";

export function HamburgerMenuDialogs({
	dialog,
	peer,
	reconnecting,
	onClose,
}: {
	dialog: MenuDialog | null;
	peer: string | undefined;
	reconnecting: boolean;
	onClose: () => void;
}) {
	const { launchAssist, armUpdateReload } = useSessionLaunchContext();
	const peerRestart = usePeerRestart();

	return (
		<>
			{dialog === "shortcuts" && <ShortcutsDialog onClose={onClose} />}
			{dialog === "restart" && peer && (
				<PeerRestartConfirmDialog
					peer={peer}
					onRestart={peerRestart.restart}
					onClose={onClose}
				/>
			)}
			{dialog === "restart" && !peer && (
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
			<PeerRestartSnackbars
				back={peerRestart.back}
				onCloseBack={peerRestart.clearBack}
				error={peerRestart.error}
				onCloseError={peerRestart.clearError}
			/>
		</>
	);
}
