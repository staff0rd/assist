import { Box, Chip, Typography } from "@mui/material";

export function PrPreviewHeader({
	title,
	prNumber,
}: {
	title: string;
	prNumber: number | null;
}) {
	const isNew = prNumber === null;
	return (
		<Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
			<Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 600 }}>
				{title}
			</Typography>
			<Chip
				size="small"
				label={isNew ? "New PR" : `Update #${prNumber}`}
				color={isNew ? "success" : "info"}
			/>
		</Box>
	);
}
