import Box from "@mui/material/Box";
import { useState } from "react";
import { Versions } from "../nodeUpdates/Versions";
import type { UpdateActions } from "../nodeUpdates/useUpdateActions";
import { ExpandButton } from "./NodeRow/ExpandButton";
import { NodeDetail } from "./NodeRow/NodeDetail";
import { NodeWho } from "./NodeRow/NodeWho";
import { nodeArticleSx, nodeRowSx } from "./NodeRow/nodeRowSx";
import { RemoveConfirm } from "./NodeRow/RemoveConfirm";
import { RowActions } from "./NodeRow/RowActions";
import { StatusCell } from "./NodeRow/StatusCell";
import { useRemoveConfirm } from "./NodeRow/useRemoveConfirm";
import type { NodeRowData } from "./nodeRows";
import { needsAttention } from "./nodeStatus";

type NodeRowProps = {
	row: NodeRowData;
	actions: UpdateActions;
	onRemove: (name: string) => Promise<void>;
};

export function NodeRow({ row, actions, onRemove }: NodeRowProps) {
	const [toggled, setToggled] = useState<boolean | undefined>(undefined);
	const removal = useRemoveConfirm(row.name, onRemove);
	const open = toggled ?? needsAttention(row.status);
	return (
		<Box
			component="article"
			aria-label={row.name}
			sx={nodeArticleSx(row.status.attention)}
		>
			<Box sx={nodeRowSx}>
				<ExpandButton
					open={open}
					label={`${open ? "Hide" : "Show"} details for ${row.name}`}
					onToggle={() => setToggled(!open)}
				/>
				<NodeWho row={row} />
				<Versions entry={row.entry} peerVersion={row.link?.peerVersion} />
				<StatusCell status={row.status} />
				<RowActions row={row} actions={actions} onRemove={removal.ask} />
			</Box>
			{removal.confirming && (
				<RemoveConfirm
					name={row.name}
					busy={removal.busy}
					onKeep={removal.keep}
					onRemove={removal.remove}
				/>
			)}
			{open && (
				<NodeDetail row={row} actions={actions} onRemove={removal.ask} />
			)}
		</Box>
	);
}
