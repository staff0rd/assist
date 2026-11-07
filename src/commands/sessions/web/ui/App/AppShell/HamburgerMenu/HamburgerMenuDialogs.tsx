import { PeerRestartConfirmDialog } from "./HamburgerMenuDialogs/PeerRestartConfirmDialog";
import { PeerSnackbars } from "../PeerSnackbars";
import { ErrorSnackbar } from "../../../ErrorSnackbar";
import { ShortcutsDialog } from "./HamburgerMenuDialogs/ShortcutsDialog";
import { TestflightTestersDialog } from "./HamburgerMenuDialogs/TestflightTestersDialog";
import { RestartConfirmDialog } from "./HamburgerMenuDialogs/RestartConfirmDialog";
import { UpdateAssistConfirmDialog } from "./HamburgerMenuDialogs/UpdateAssistConfirmDialog";
import type { MenuActions } from "./useMenuActions";
import type { MenuDialog } from "./useMenuDialog";

export function HamburgerMenuDialogs({
	dialog,
	peer,
	actions,
	onClose,
}: {
	dialog: MenuDialog | null;
	peer: string | undefined;
	actions: MenuActions;
	onClose: () => void;
}) {
	const { localRestart, peerRestart, peerUpdate } = actions;

	return (
		<>
			{dialog === "shortcuts" && <ShortcutsDialog onClose={onClose} />}
			{dialog === "testflight" && <TestflightTestersDialog onClose={onClose} />}
			{dialog === "restart" && peer && (
				<PeerRestartConfirmDialog
					peer={peer}
					onRestart={peerRestart.restart}
					onClose={onClose}
				/>
			)}
			{dialog === "restart" && !peer && (
				<RestartConfirmDialog
					pending={localRestart.pending}
					onRestart={() => void localRestart.restart()}
					onClose={onClose}
				/>
			)}
			{dialog === "update" && (
				<UpdateAssistConfirmDialog
					peer={peer}
					onConfirm={actions.update}
					onClose={onClose}
				/>
			)}
			<ErrorSnackbar
				error={localRestart.error}
				onClose={localRestart.clearError}
			/>
			<PeerSnackbars notices={peerRestart} />
			<PeerSnackbars notices={peerUpdate} />
		</>
	);
}
