import HomeOutlined from "@mui/icons-material/HomeOutlined";
import Tooltip from "@mui/material/Tooltip";

export function CloneBadge({ clone }: { clone: string }) {
	return (
		<Tooltip title={`Clone — ${clone}`}>
			<HomeOutlined sx={{ fontSize: 13, color: "info.main" }} />
		</Tooltip>
	);
}
