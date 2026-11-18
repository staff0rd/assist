import BuildIcon from "@mui/icons-material/Build";
import { sessionTypeSize } from "../../../../../sessionTypeSize";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function ToolRow({ tool, target }: { tool: string; target: string }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5, pl: 1 }}>
			<BuildIcon sx={{ fontSize: 14, color: "text.disabled" }} />
			<Typography
				variant="caption"
				sx={{
					color: "text.secondary",
					fontFamily: "fontFamilyMono",
					fontSize: sessionTypeSize("caption"),
				}}
			>
				<Box component="span" sx={{ color: "warning.main" }}>
					{tool}
				</Box>
				{target && <Box component="span"> {target}</Box>}
			</Typography>
		</Box>
	);
}
