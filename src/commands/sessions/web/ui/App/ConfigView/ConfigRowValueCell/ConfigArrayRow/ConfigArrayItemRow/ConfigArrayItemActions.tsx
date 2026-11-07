import type { ConfigNode } from "../../../../../../../../../shared/ConfigNode";
import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import { ConfigArrayItemRemoveDialog } from "./ConfigArrayItemActions/ConfigArrayItemRemoveDialog";
import { configArrayItemActionState } from "./ConfigArrayItemActions/configArrayItemActionState";
import { ConfigEntryActions } from "../../ConfigEntryActions";
import type { useConfigArrayRowEditor } from "../useConfigArrayRowEditor";
import { useShiftSkipConfirm } from "../../../../../useShiftSkipConfirm";

type Props = {
	entry: ConfigEntry;
	node: ConfigNode;
	index: number;
	editor: ReturnType<typeof useConfigArrayRowEditor>;
};

export function ConfigArrayItemActions({ entry, node, index, editor }: Props) {
	const remove = () => void editor.remove(index);
	const { confirming, close, triggerHandlers, withHint } =
		useShiftSkipConfirm(remove);
	const { label, canRemove, canMoveUp, canMoveDown, titles } =
		configArrayItemActionState(entry, node, index, editor);

	return (
		<>
			<ConfigEntryActions
				label={label}
				disabled={editor.saving}
				open={editor.isOpen(index)}
				titles={
					canRemove ? { ...titles, remove: withHint(titles.remove) } : titles
				}
				canMoveUp={canMoveUp}
				canMoveDown={canMoveDown}
				canRemove={canRemove}
				onToggle={() => editor.toggle(index)}
				onDuplicate={() => editor.duplicate(index)}
				onMoveUp={() => void editor.move(index, -1)}
				onMoveDown={() => void editor.move(index, 1)}
				onRemove={triggerHandlers.onClick}
				onRemoveKeyDown={triggerHandlers.onKeyDown}
			/>
			{confirming && (
				<ConfigArrayItemRemoveDialog
					label={label}
					message={titles.removeConfirm}
					onConfirm={remove}
					onCancel={close}
				/>
			)}
		</>
	);
}
