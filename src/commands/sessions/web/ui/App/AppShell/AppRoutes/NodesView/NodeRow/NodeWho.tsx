import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { NodeDot } from "../../../../../HomeNodeGate/NodeDot";
import { linkStateTone } from "../../../../../PhoneShell/PhoneNodesSheet/linkStateTone";
import type { NodeRowData } from "../nodeRows";

const SCHEME = /^https?:[/]{2}/;

export function NodeWho({ row }: { row: NodeRowData }) {
	return (
		<Box
			sx={{
				display: "grid",
				gridTemplateColumns: "8px minmax(0,1fr)",
				columnGap: 1.25,
				alignItems: "center",
				minWidth: 0,
			}}
		>
			<NodeDot tone={row.link ? linkStateTone[row.link.state] : "ok"} />
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
				<Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
					{row.name}
				</Typography>
				{row.local && (
					<Chip label="This node" size="small" variant="outlined" />
				)}
			</Box>
			<Typography
				variant="caption"
				color="text.secondary"
				noWrap
				sx={{ gridColumn: 2, fontFamily: "fontFamilyMono" }}
			>
				{row.url.replace(SCHEME, "")}
			</Typography>
		</Box>
	);
}
