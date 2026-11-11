import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { UpdateActions } from "../nodeUpdates/useUpdateActions";
import { NodesHeaderActions } from "./NodesHeaderActions";
import type { NodeRowData } from "./nodeRows";
import { nodesSummary } from "./nodesSummary";

export function NodesHeader({
	rows,
	actions,
	onAddNode,
}: {
	rows: NodeRowData[];
	actions: UpdateActions;
	onAddNode: () => void;
}) {
	const trusted = rows.flatMap((row) => (row.entry ? [row.entry] : []));
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "flex-end",
				gap: 2,
				flexWrap: "wrap",
				mb: 3,
			}}
		>
			<Box sx={{ flex: "1 1 260px", minWidth: 0 }}>
				<Typography variant="h5" component="h1">
					Nodes
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{nodesSummary(rows)}
				</Typography>
			</Box>
			<NodesHeaderActions
				entries={trusted}
				actions={actions}
				onAddNode={onAddNode}
			/>
		</Box>
	);
}
