import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";

export function CallHead({ tool }: { tool: string }) {
	return (
		<>
			<BuildIcon sx={{ fontSize: 14, color: "text.disabled", flex: "none" }} />
			<Box
				component="span"
				sx={{ color: "warning.main", fontFamily: "fontFamilyMono" }}
			>
				{tool}
			</Box>
		</>
	);
}
