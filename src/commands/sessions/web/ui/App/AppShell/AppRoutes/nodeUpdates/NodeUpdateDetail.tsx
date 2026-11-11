import Typography from "@mui/material/Typography";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { AutoRestartSwitch } from "./AutoRestartSwitch";
import { Advice } from "./NodeUpdateDetail/Advice";
import { History } from "./NodeUpdateDetail/History";
import { useLiveHistory } from "./NodeUpdateDetail/useLiveHistory";
import { updateState } from "./updateState";
import type { UpdateActions } from "./useUpdateActions";

export function NodeUpdateDetail({
	entry,
	actions,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
}) {
	const history = useLiveHistory(entry);
	return (
		<>
			<Advice entry={entry} state={updateState(entry)} actions={actions} />
			<AutoRestartSwitch entry={entry} actions={actions} />
			<Typography variant="caption" color="text.secondary">
				History · ~/.assist/watchers/
			</Typography>
			<History lines={history} />
		</>
	);
}
