import MenuItem from "@mui/material/MenuItem";
import { canControl } from "../../../nodeUpdates/canControl";
import type { UpdateActions } from "../../../nodeUpdates/useUpdateActions";
import type { NodeRowData } from "../../nodeRows";
import { AutoRestartMenuItem } from "./AutoRestartMenuItem";

export function updateMenuItems(
	row: NodeRowData,
	actions: UpdateActions,
	close: () => void,
) {
	const { entry } = row;
	if (!entry)
		return [
			<MenuItem key="no-link" disabled>
				Update controls need a link
			</MenuItem>,
		];
	const items = [];
	if (canControl(entry)) {
		const paused = entry.status?.loop.paused === true;
		items.push(
			<MenuItem
				key="pause"
				disabled={actions.notices.busy[entry.name] !== undefined}
				onClick={() => {
					close();
					void actions.control(entry, paused ? "resume" : "pause");
				}}
			>
				{paused ? "Resume updates" : "Pause updates"}
			</MenuItem>,
		);
	}
	if (entry.status?.autoRestart !== undefined)
		items.push(
			<AutoRestartMenuItem
				key="auto-restart"
				entry={entry}
				actions={actions}
				onDone={close}
			/>,
		);
	return items;
}
