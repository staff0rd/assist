import Stack from "@mui/material/Stack";
import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { ConfigEditorActions } from "./ConfigEditorActions";
import { ConfigNodeEditor } from "./ConfigNodeEditor";
import { useConfigRowEditor } from "./ConfigRowEditor/useConfigRowEditor";

type Props = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
	onCancel: () => void;
};

export function ConfigRowEditor({
	entry,
	cwd,
	onSaved,
	onError,
	onCancel,
}: Props) {
	const {
		value,
		setValue,
		scope,
		setScope,
		scopeLocked,
		saving,
		save,
		clear,
		canClear,
	} = useConfigRowEditor({ entry, cwd, onSaved, onError });

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start" }}>
			{entry.node && (
				<ConfigNodeEditor
					node={entry.node}
					label={entry.key}
					value={value}
					disabled={saving}
					onChange={setValue}
				/>
			)}
			<ConfigEditorActions
				entry={entry}
				scope={scope}
				scopeLocked={scopeLocked}
				saving={saving}
				canClear={canClear}
				onScopeChange={setScope}
				onSave={() => void save()}
				onClear={() => void clear()}
				onCancel={onCancel}
			/>
		</Stack>
	);
}
