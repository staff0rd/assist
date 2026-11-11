import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import type { NodeUpdateEntry } from "../../../../NodeUpdateEntry";
import { useAutoRestart } from "../../../nodeUpdates/AutoRestartSwitch/useAutoRestart";
import type { UpdateActions } from "../../../nodeUpdates/useUpdateActions";

export function AutoRestartMenuItem({
	entry,
	actions,
	onDone,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
	onDone: () => void;
}) {
	const { checked, saving, toggle } = useAutoRestart(entry, actions);
	return (
		<MenuItem
			disabled={saving}
			onClick={() => {
				onDone();
				void toggle(!checked);
			}}
			sx={{ justifyContent: "space-between", gap: 2 }}
		>
			Auto-restart
			<Typography variant="caption" color="text.secondary">
				{checked ? "On" : "Off"}
			</Typography>
		</MenuItem>
	);
}
