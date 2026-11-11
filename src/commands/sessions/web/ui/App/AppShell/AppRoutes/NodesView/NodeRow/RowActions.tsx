import Box from "@mui/material/Box";
import { OpenFixButton } from "../../nodeUpdates/OpenFixButton";
import { RestartNodeButton } from "../../nodeUpdates/RestartNodeButton";
import { RestartWebButton } from "../../nodeUpdates/RestartWebButton";
import type { UpdateActions } from "../../nodeUpdates/useUpdateActions";
import type { NodeRowData } from "../nodeRows";
import { NodeMenu } from "./NodeMenu";

function ContextualAction({
	row,
	actions,
}: {
	row: NodeRowData;
	actions: UpdateActions;
}) {
	const { entry, status } = row;
	if (!entry) return null;
	if (status.action === "restart")
		return <RestartNodeButton entry={entry} actions={actions} />;
	if (status.action === "web")
		return <RestartWebButton entry={entry} actions={actions} />;
	if (status.action === "fix")
		return <OpenFixButton entry={entry} actions={actions} />;
	return null;
}

export function RowActions({
	row,
	actions,
	onRemove,
}: {
	row: NodeRowData;
	actions: UpdateActions;
	onRemove: () => void;
}) {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 0.5,
				justifyContent: "flex-end",
				gridColumn: { xs: 3, sm: "auto" },
				gridRow: { xs: 1, sm: "auto" },
			}}
		>
			<ContextualAction row={row} actions={actions} />
			<NodeMenu row={row} actions={actions} onRemove={onRemove} />
		</Box>
	);
}
