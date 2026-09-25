import Stack from "@mui/material/Stack";
import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { configClearTitle } from "./ConfigEditorActions/configClearTitle";
import { ConfigScopeToggle } from "./ConfigEditorActions/ConfigScopeToggle";
import { configScopesWithValue } from "./configScopesWithValue";
import { ConfigWriteButtons } from "./ConfigEditorActions/ConfigWriteButtons";
import { ConfigWriteNote } from "./ConfigEditorActions/ConfigWriteNote";
import { ConfigWriteTargetHint } from "./ConfigEditorActions/ConfigWriteTargetHint";
import type { ConfigScope } from "./saveConfigValue";

type Props = {
	entry: ConfigEntry;
	scope: ConfigScope;
	scopeLocked: boolean;
	saving: boolean;
	canClear?: boolean;
	note?: string;
	onScopeChange: (scope: ConfigScope) => void;
	onSave: () => void;
	onClear?: () => void;
	onCancel: () => void;
};

export function ConfigEditorActions({
	entry,
	scope,
	scopeLocked,
	saving,
	canClear,
	note,
	onScopeChange,
	onSave,
	onClear,
	onCancel,
}: Props) {
	return (
		<Stack spacing={0.5} sx={{ alignItems: "flex-start" }}>
			<Stack
				spacing={1}
				direction="row"
				sx={{ alignItems: "center", flexWrap: "wrap" }}
			>
				<ConfigScopeToggle
					scope={scope}
					disabled={saving}
					lockedToGlobal={scopeLocked}
					scopesWithValue={configScopesWithValue(entry)}
					repoKey={entry.repoKey}
					globalConfigFile={entry.globalConfigFile}
					onChange={onScopeChange}
				/>
				<ConfigWriteButtons
					saving={saving}
					canClear={canClear}
					clearTitle={configClearTitle(entry, scope)}
					onSave={onSave}
					onClear={onClear}
					onCancel={onCancel}
				/>
			</Stack>
			<ConfigWriteTargetHint
				scope={scope}
				repoKey={entry.repoKey}
				globalConfigFile={entry.globalConfigFile}
			/>
			<ConfigWriteNote note={note} />
		</Stack>
	);
}
