import Stack from "@mui/material/Stack";
import type { ConfigObjectListNode } from "../../../../../../../shared/ConfigNode";
import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { ConfigAddEntryButton } from "./ConfigAddEntryButton";
import { ConfigArrayItemRow } from "./ConfigArrayRow/ConfigArrayItemRow";
import { useConfigArrayRowEditor } from "./ConfigArrayRow/useConfigArrayRowEditor";

type Props = {
	entry: ConfigEntry;
	node: ConfigObjectListNode;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function ConfigArrayRow({ entry, node, cwd, onSaved, onError }: Props) {
	const editor = useConfigArrayRowEditor({ entry, cwd, onSaved, onError });

	return (
		<Stack spacing={1} sx={{ alignItems: "flex-start", width: "100%" }}>
			{Array.from({ length: editor.rowCount }, (_unused, index) => (
				<ConfigArrayItemRow
					key={`[${index}]`}
					entry={entry}
					node={node.item}
					index={index}
					editor={editor}
				/>
			))}
			<ConfigAddEntryButton
				label={entry.key}
				disabled={editor.saving}
				onClick={editor.add}
			/>
		</Stack>
	);
}
