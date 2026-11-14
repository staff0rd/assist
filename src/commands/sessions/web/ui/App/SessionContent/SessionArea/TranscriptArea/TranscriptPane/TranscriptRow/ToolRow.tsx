import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export function ToolRow({
	tool,
	target,
	description,
}: {
	tool: string;
	target: string;
	description?: string;
}) {
	const detail = description || target;
	return (
		<Box
			title={target || undefined}
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				py: 0.5,
				pl: 1,
				minWidth: 0,
			}}
		>
			<BuildIcon sx={{ fontSize: 14, color: "text.disabled", flex: "none" }} />
			<Typography
				variant="caption"
				noWrap
				sx={{
					color: "text.secondary",
					fontFamily: "fontFamilyMono",
					minWidth: 0,
				}}
			>
				<Box component="span" sx={{ color: "warning.main" }}>
					{tool}
				</Box>
				{detail && <Box component="span"> {detail}</Box>}
			</Typography>
		</Box>
	);
}
