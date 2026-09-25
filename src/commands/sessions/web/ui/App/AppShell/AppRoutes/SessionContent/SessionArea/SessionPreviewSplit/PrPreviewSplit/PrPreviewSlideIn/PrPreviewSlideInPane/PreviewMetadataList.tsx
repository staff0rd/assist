import { Box, Typography } from "@mui/material";
import type { PreviewMetadata } from "../../../../../../../../../../../shared/SessionInfoBase";

const rowSx = {
	px: 2,
	pb: 2,
	display: "flex",
	flexWrap: "wrap",
	columnGap: 3,
	rowGap: 0.5,
} as const;

export function PreviewMetadataList({ items }: { items: PreviewMetadata[] }) {
	if (items.length === 0) return null;
	return (
		<Box sx={rowSx}>
			{items.map((item) => (
				<Typography key={item.label} variant="body2" color="text.secondary">
					{item.label}:{" "}
					<Box component="span" sx={{ color: "text.primary" }}>
						{item.value}
					</Box>
				</Typography>
			))}
		</Box>
	);
}
