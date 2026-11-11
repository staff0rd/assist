import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { NodeDot, type NodeDotTone } from "../../../../HomeNodeGate/NodeDot";
import { nodeCellSx } from "./nodeRowSx";

type NodeRowCellsProps = {
	tone: NodeDotTone;
	name: ReactNode;
	url: string;
	state: string;
	caption?: string;
	actions?: ReactNode;
};

export function NodeRowCells(props: NodeRowCellsProps) {
	return (
		<>
			<NodeDot tone={props.tone} />
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
				{props.name}
			</Box>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{
					...nodeCellSx,
					fontFamily: "fontFamilyMono",
					overflowWrap: "anywhere",
				}}
			>
				{props.url}
			</Typography>
			<Box sx={{ ...nodeCellSx, display: "flex", flexDirection: "column" }}>
				<Typography variant="body2">{props.state}</Typography>
				{props.caption && (
					<Typography variant="caption" color="text.secondary">
						{props.caption}
					</Typography>
				)}
			</Box>
			<Box
				sx={{
					display: "flex",
					justifyContent: "flex-end",
					gridColumn: { xs: "3", sm: "auto" },
					gridRow: { xs: "1", sm: "auto" },
				}}
			>
				{props.actions}
			</Box>
		</>
	);
}
