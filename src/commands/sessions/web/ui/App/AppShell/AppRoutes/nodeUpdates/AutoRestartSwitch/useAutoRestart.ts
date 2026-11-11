import { useState } from "react";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { useNodeUpdatesContext } from "../../../useNodeUpdatesContext";
import type { UpdateActions } from "../useUpdateActions";
import { saveAutoRestart } from "./saveAutoRestart";

export function useAutoRestart(entry: NodeUpdateEntry, actions: UpdateActions) {
	const { refresh } = useNodeUpdatesContext();
	const [saving, setSaving] = useState<boolean | undefined>(undefined);
	const status = entry.status;
	const available = status?.autoRestart !== undefined;
	const checked = saving ?? status?.autoRestart === true;

	const toggle = async (next: boolean) => {
		if (!status) return;
		setSaving(next);
		const { error } = await saveAutoRestart(entry, status.installDir, next);
		if (error)
			actions.notices.setError(
				`Auto-restart for ${entry.name} not saved: ${error}`,
			);
		refresh();
		setSaving(undefined);
	};

	return { available, checked, saving: saving !== undefined, toggle };
}
