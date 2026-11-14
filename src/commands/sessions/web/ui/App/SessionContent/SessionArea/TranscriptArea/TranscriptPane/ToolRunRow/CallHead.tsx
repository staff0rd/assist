import BuildIcon from "@mui/icons-material/Build";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";

const iconSx = { fontSize: 14, color: "text.disabled", flex: "none" } as const;

export function CallHead({ tool }: { tool: string }) {
	return (
		<>
			{tool === "Artifact" ? (
				<WidgetsOutlinedIcon data-testid="artifact-icon" sx={iconSx} />
			) : (
				<BuildIcon sx={iconSx} />
			)}
			<Box
				component="span"
				sx={{ color: "warning.main", fontFamily: "fontFamilyMono" }}
			>
				{tool}
			</Box>
		</>
	);
}
