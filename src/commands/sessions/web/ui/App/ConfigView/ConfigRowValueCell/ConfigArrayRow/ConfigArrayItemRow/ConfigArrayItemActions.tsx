import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import { configArrayItemActionTitles } from "./ConfigArrayItemActions/configArrayItemActionTitles";
import { ConfigEntryActions } from "../../ConfigEntryActions";
import type { useConfigArrayRowEditor } from "../useConfigArrayRowEditor";

type Props = {
	entry: ConfigEntry;
	index: number;
	editor: ReturnType<typeof useConfigArrayRowEditor>;
};

export function ConfigArrayItemActions({ entry, index, editor }: Props) {
	const label = `${entry.key}[${index}]`;
	const ownerScope = editor.items[index]?.owner?.scope;
	const canMoveUp = editor.canMove(index, -1);
	const canMoveDown = editor.canMove(index, 1);

	return (
		<ConfigEntryActions
			label={label}
			disabled={editor.saving}
			open={editor.isOpen(index)}
			titles={configArrayItemActionTitles({
				label,
				ownerScope,
				repoKey: entry.repoKey,
				globalConfigFile: entry.globalConfigFile,
				canMoveUp,
				canMoveDown,
			})}
			canMoveUp={canMoveUp}
			canMoveDown={canMoveDown}
			canRemove={ownerScope !== undefined}
			onToggle={() => editor.toggle(index)}
			onMoveUp={() => void editor.move(index, -1)}
			onMoveDown={() => void editor.move(index, 1)}
			onRemove={() => void editor.remove(index)}
		/>
	);
}
