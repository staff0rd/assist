import type { ConfigNode } from "../../../../../../../../../../shared/ConfigNode";
import type { ConfigEntry } from "../../../../../../../../../config/readConfigEntries";
import { configEntrySummary } from "../../../configEntrySummary";
import type { useConfigArrayRowEditor } from "../../useConfigArrayRowEditor";
import { configArrayItemActionTitles } from "./configArrayItemActionTitles";

export function configArrayItemActionState(
	entry: ConfigEntry,
	node: ConfigNode,
	index: number,
	editor: ReturnType<typeof useConfigArrayRowEditor>,
) {
	const label = `${entry.key}[${index}]`;
	const ownerScope = editor.itemAt(index)?.owner?.scope;
	const canMoveUp = editor.canMove(index, -1);
	const canMoveDown = editor.canMove(index, 1);
	const titles = configArrayItemActionTitles({
		label,
		summary: configEntrySummary(node, editor.valueOf(index)),
		ownerScope,
		repoKey: entry.repoKey,
		globalConfigFile: entry.globalConfigFile,
		canMoveUp,
		canMoveDown,
	});
	return {
		label,
		canRemove: ownerScope !== undefined,
		canMoveUp,
		canMoveDown,
		titles,
	};
}
