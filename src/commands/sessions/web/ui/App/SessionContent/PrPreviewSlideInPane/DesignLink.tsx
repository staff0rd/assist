import { Box, Button, Typography } from "@mui/material";

const rowSx = {
	px: 2,
	pb: 2,
	display: "flex",
	alignItems: "center",
	gap: 1.5,
	minWidth: 0,
} as const;

const urlSx = {
	color: "text.secondary",
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
} as const;

export function DesignLink({ url }: { url: string }) {
	return (
		<Box sx={rowSx}>
			<Button
				variant="contained"
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				sx={{ flexShrink: 0 }}
			>
				Open design ↗
			</Button>
			<Typography variant="body2" sx={urlSx} title={url}>
				{url}
			</Typography>
		</Box>
	);
}
