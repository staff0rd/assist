import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { ConfigNode } from "../../../../../../../../../../../../shared/ConfigNode";
import type { ConfigEntry } from "../../../../../../../../../../../config/readConfigEntries";
import { ConfigArrayItemActions } from "./ConfigArrayItemRow/ConfigArrayItemActions";
import { ConfigArrayItemBody } from "./ConfigArrayItemRow/ConfigArrayItemBody";
import { ConfigArrayItemWriteActions } from "./ConfigArrayItemRow/ConfigArrayItemWriteActions";
import { ConfigSourceChip } from "../../ConfigSourceChip";
import type { useConfigArrayRowEditor } from "./useConfigArrayRowEditor";

type Props = {
	entry: ConfigEntry;
	node: ConfigNode;
	index: number;
	editor: ReturnType<typeof useConfigArrayRowEditor>;
};

export function ConfigArrayItemRow({ entry, node, index, editor }: Props) {
	const open = editor.isOpen(index);

	return (
		<Stack spacing={0.5} sx={{ width: "100%" }} data-testid="config-array-item">
			<Box
				sx={{ display: "flex", gap: 1, width: "100%", alignItems: "center" }}
			>
				<ConfigArrayItemBody
					node={node}
					label={`${entry.key}[${index}]`}
					value={editor.valueOf(index)}
					open={open}
					disabled={editor.saving}
					onChange={editor.setValue}
				/>
				<ConfigSourceChip
					source={editor.items[index]?.owner?.scope ?? "default"}
					repoKey={entry.repoKey}
				/>
				<ConfigArrayItemActions entry={entry} index={index} editor={editor} />
			</Box>
			{open && (
				<ConfigArrayItemWriteActions
					entry={entry}
					index={index}
					editor={editor}
				/>
			)}
		</Stack>
	);
}
