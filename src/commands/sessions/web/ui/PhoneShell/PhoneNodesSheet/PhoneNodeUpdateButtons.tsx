import { canControl } from "../../App/AppShell/AppRoutes/UpdatesView/canControl";
import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import type { phoneUpdateState } from "../PhoneNodeUpdates/phoneUpdateState";
import { PhoneSheetButton } from "../PhoneSheetButton";
import type { UpdateConfirm } from "./PhoneNodeUpdateConfirm";

type Props = {
	entry: NodeUpdateEntry;
	state: ReturnType<typeof phoneUpdateState>;
	latest: string | undefined;
	busy: boolean;
	onConfirm: (confirm: UpdateConfirm) => void;
	onCheck: () => void;
};

export function PhoneNodeUpdateButtons({
	entry,
	state,
	latest,
	busy,
	onConfirm,
	onCheck,
}: Props) {
	return (
		<>
			{state.restartPending && (
				<PhoneSheetButton disabled={busy} onClick={() => onConfirm("restart")}>
					Restart
				</PhoneSheetButton>
			)}
			<PhoneSheetButton
				variant={state.updateAvailable ? "contained" : "outlined"}
				disabled={busy || !entry.status}
				onClick={() => onConfirm("update")}
			>
				{state.updateAvailable ? `Update to v${latest}` : "Update"}
			</PhoneSheetButton>
			{canControl(entry) && !entry.status?.loop.paused && (
				<PhoneSheetButton variant="outlined" disabled={busy} onClick={onCheck}>
					Check now
				</PhoneSheetButton>
			)}
		</>
	);
}
