import Box from "@mui/material/Box";
import type { UpdateActions } from "../../nodeUpdates/useUpdateActions";
import type { NodeRowData } from "../nodeRows";
import { ConnectionPanel } from "./NodeDetail/ConnectionPanel";
import { UpdatesPanel } from "./NodeDetail/UpdatesPanel";

export function NodeDetail({
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
				px: 2,
				pb: 2,
				pl: { xs: 2, sm: 7 },
				display: "grid",
				gridTemplateColumns: {
					xs: "minmax(0,1fr)",
					sm: "minmax(0,1fr) minmax(0,1.4fr)",
				},
				gap: { xs: 2, sm: 3 },
			}}
		>
			<ConnectionPanel row={row} onRemove={onRemove} />
			<UpdatesPanel row={row} actions={actions} />
		</Box>
	);
}
