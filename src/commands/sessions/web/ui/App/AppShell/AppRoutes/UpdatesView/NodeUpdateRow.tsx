import Box from "@mui/material/Box";
import { useState } from "react";
import type { NodeUpdateEntry } from "../../NodeUpdateEntry";
import { ExpandButton } from "./NodeUpdateRow/ExpandButton";
import { NodeName } from "./NodeUpdateRow/NodeName";
import { NodeUpdateDetail } from "./NodeUpdateRow/NodeUpdateDetail";
import { RowActions } from "./NodeUpdateRow/RowActions";
import { nodeUpdateRowSx } from "./NodeUpdateRow/nodeUpdateRowSx";
import { StateCell } from "./NodeUpdateRow/StateCell";
import { Versions } from "./NodeUpdateRow/Versions";
import { updateState } from "./updateState";
import type { UpdateActions } from "./useUpdateActions";

export function NodeUpdateRow({
	entry,
	actions,
}: {
	entry: NodeUpdateEntry;
	actions: UpdateActions;
}) {
	const [open, setOpen] = useState(false);
	const state = updateState(entry);
	return (
		<Box
			component="article"
			sx={{ "& + &": { borderTop: 1, borderColor: "divider" } }}
		>
			<Box sx={nodeUpdateRowSx(state.kind)}>
				<ExpandButton
					open={open}
					label={`${open ? "Hide" : "Show"} history for ${entry.name}`}
					onToggle={() => setOpen((o) => !o)}
				/>
				<NodeName entry={entry} />
				<Versions entry={entry} />
				<StateCell state={state} />
				<RowActions entry={entry} state={state} actions={actions} />
			</Box>
			{open && (
				<NodeUpdateDetail entry={entry} state={state} actions={actions} />
			)}
		</Box>
	);
}
