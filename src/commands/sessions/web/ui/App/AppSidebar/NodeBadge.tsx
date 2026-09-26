import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";

const chipSx = { height: 16, fontSize: "0.65rem" };

export function NodeBadge({ node }: { node?: string }) {
	if (!node) return null;
	return (
		<Tooltip title={`Running on ${node}`}>
			<Chip
				label={node}
				size="small"
				color="info"
				variant="outlined"
				sx={chipSx}
			/>
		</Tooltip>
	);
}
