import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { NodeStatus } from "../nodeStatus";
import { nodeCellSx } from "./nodeRowSx";
import { StatusChip } from "./StatusChip";

export function StatusCell({ status }: { status: NodeStatus }) {
	return (
		<Box
			sx={{
				...nodeCellSx,
				display: "flex",
				flexDirection: "column",
				gap: 0.25,
			}}
		>
			<StatusChip status={status} />
			<Typography variant="caption" color="text.secondary" noWrap>
				{status.line}
			</Typography>
		</Box>
	);
}
