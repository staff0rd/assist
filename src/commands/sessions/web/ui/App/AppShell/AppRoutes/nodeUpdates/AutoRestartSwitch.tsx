import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import type { UpdateActions } from "./useUpdateActions";
import { useAutoRestart } from "./AutoRestartSwitch/useAutoRestart";

export function AutoRestartSwitch({
	entry,
	actions,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
}) {
	const { available, checked, saving, toggle } = useAutoRestart(entry, actions);
	if (!available) return null;
	return (
		<FormControlLabel
			label="Restart automatically when a build is ready"
			slotProps={{ typography: { variant: "body2" } }}
			sx={{ mr: 0 }}
			control={
				<Switch
					size="small"
					checked={checked}
					disabled={saving}
					onChange={(_event, next) => void toggle(next)}
					slotProps={{
						input: { "aria-label": `Auto-restart ${entry.name}` },
					}}
				/>
			}
		/>
	);
}
