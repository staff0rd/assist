import type { ConfigEntry } from "../../../../../../../../../../../../config/readConfigEntries";
import { configArrayItemWriteNote } from "./ConfigArrayItemWriteActions/configArrayItemWriteNote";
import { ConfigEditorActions } from "../../ConfigEditorActions";
import type { useConfigArrayRowEditor } from "../useConfigArrayRowEditor";

type Props = {
	entry: ConfigEntry;
	index: number;
	editor: ReturnType<typeof useConfigArrayRowEditor>;
};

export function ConfigArrayItemWriteActions({ entry, index, editor }: Props) {
	const scope = editor.scopeOf(index);

	return (
		<ConfigEditorActions
			entry={entry}
			scope={scope}
			scopeLocked={entry.globalOnly === true}
			saving={editor.saving}
			note={configArrayItemWriteNote({
				key: entry.key,
				ownerScope: editor.items[index]?.owner?.scope,
				arrayOwnerScope: editor.items[0]?.owner?.scope,
				targetScope: scope,
				repoKey: entry.repoKey,
				globalConfigFile: entry.globalConfigFile,
			})}
			onScopeChange={editor.setScope}
			onSave={() => void editor.save()}
			onCancel={editor.cancel}
		/>
	);
}
