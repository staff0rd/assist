import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useNodeName } from "./NodeNameLabel/useNodeName";

const sx = { color: "text.secondary", mr: 1.5, whiteSpace: "nowrap" } as const;

export function NodeNameLabel() {
	const nodeName = useNodeName();
	if (!nodeName) return null;
	return (
		<Tooltip title="This machine (sessions.nodeName)">
			<Typography variant="caption" sx={sx}>
				{nodeName}
			</Typography>
		</Tooltip>
	);
}
