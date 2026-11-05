import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useState } from "react";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { useNodeUpdatesContext } from "../../../useNodeUpdatesContext";
import type { UpdateActions } from "../useUpdateActions";
import { saveAutoRestart } from "./AutoRestartSwitch/saveAutoRestart";

export function AutoRestartSwitch({
	entry,
	actions,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
}) {
	const { refresh } = useNodeUpdatesContext();
	const [saving, setSaving] = useState<boolean | undefined>(undefined);
	const status = entry.status;
	if (status?.autoRestart === undefined) return null;
	const checked = saving ?? status.autoRestart;

	const toggle = async (next: boolean) => {
		setSaving(next);
		const { error } = await saveAutoRestart(entry, status.installDir, next);
		if (error)
			actions.notices.setError(
				`Auto-restart for ${entry.name} not saved: ${error}`,
			);
		refresh();
		setSaving(undefined);
	};

	return (
		<FormControlLabel
			label="Auto-restart"
			slotProps={{ typography: { variant: "body2", noWrap: true } }}
			sx={{ mr: 0 }}
			control={
				<Switch
					size="small"
					checked={checked}
					disabled={saving !== undefined}
					onChange={(_event, next) => void toggle(next)}
					slotProps={{
						input: { "aria-label": `Auto-restart ${entry.name}` },
					}}
				/>
			}
		/>
	);
}
