import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { stackSx } from "./stackSx";

export function NodeName({ entry }: { entry: NodeUpdateEntry }) {
	const where = entry.local ? "this machine" : "linked";
	return (
		<Box sx={stackSx}>
			<Typography variant="body2" sx={{ fontWeight: 500 }}>
				{entry.name}
			</Typography>
			<Typography variant="caption" color="text.secondary" noWrap>
				{entry.status ? `${where} · ${entry.status.installDir}` : where}
			</Typography>
		</Box>
	);
}
