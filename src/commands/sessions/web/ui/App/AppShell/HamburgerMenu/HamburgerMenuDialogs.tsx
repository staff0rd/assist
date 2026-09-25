import { RestartConfirmDialog } from "./HamburgerMenuDialogs/RestartConfirmDialog";
import { UpdateAssistConfirmDialog } from "./HamburgerMenuDialogs/UpdateAssistConfirmDialog";
import { useSessionLaunchContext } from "../../../useSessionLaunchContext";

type HamburgerMenuDialogsProps = {
	restarting: boolean;
	reconnecting: boolean;
	onCloseRestart: () => void;
	updating: boolean;
	onCloseUpdate: () => void;
};

export function HamburgerMenuDialogs({
	restarting,
	reconnecting,
	onCloseRestart,
	updating,
	onCloseUpdate,
}: HamburgerMenuDialogsProps) {
	const { launchAssist, armUpdateReload } = useSessionLaunchContext();

	return (
		<>
			{restarting && (
				<RestartConfirmDialog
					reconnecting={reconnecting}
					onClose={onCloseRestart}
				/>
			)}
			{updating && (
				<UpdateAssistConfirmDialog
					onConfirm={() => {
						armUpdateReload();
						launchAssist(["update"]);
					}}
					onClose={onCloseUpdate}
				/>
			)}
		</>
	);
}
