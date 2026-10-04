import { PeerRestartConfirmDialog } from "./HamburgerMenuDialogs/PeerRestartConfirmDialog";
import { PeerSnackbars } from "./HamburgerMenuDialogs/PeerSnackbars";
import { ShortcutsDialog } from "./HamburgerMenuDialogs/ShortcutsDialog";
import { RestartConfirmDialog } from "./HamburgerMenuDialogs/RestartConfirmDialog";
import { UpdateAssistConfirmDialog } from "./HamburgerMenuDialogs/UpdateAssistConfirmDialog";
import { usePeerRestart } from "./HamburgerMenuDialogs/usePeerRestart";
import { usePeerUpdate } from "./HamburgerMenuDialogs/usePeerUpdate";
import type { MenuDialog } from "./useMenuDialog";
import type { SessionInfo } from "../../../types";
import { useSessionLaunchContext } from "../../../useSessionLaunchContext";

export function HamburgerMenuDialogs({
	dialog,
	peer,
	sessions,
	reconnecting,
	onClose,
}: {
	dialog: MenuDialog | null;
	peer: string | undefined;
	sessions: SessionInfo[];
	reconnecting: boolean;
	onClose: () => void;
}) {
	const { launchAssist, armUpdateReload } = useSessionLaunchContext();
	const peerRestart = usePeerRestart();
	const peerUpdate = usePeerUpdate(sessions);

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
					peer={peer}
					onConfirm={() => {
						if (peer) {
							peerUpdate.update(peer);
							return;
						}
						armUpdateReload();
						launchAssist(["update"]);
					}}
					onClose={onClose}
				/>
			)}
			<PeerSnackbars notices={peerRestart} />
			<PeerSnackbars notices={peerUpdate} />
		</>
	);
}
