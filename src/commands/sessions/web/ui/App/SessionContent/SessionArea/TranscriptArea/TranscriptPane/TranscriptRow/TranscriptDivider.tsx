import Box from "@mui/material/Box";

const line = { content: '""', flex: 1, height: "1px", bgcolor: "divider" };

export function TranscriptDivider({ label }: { label: string }) {
	return (
		<Box
			role="separator"
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1.25,
				mt: 0.75,
				mb: 1.75,
				fontSize: 12,
				color: "text.secondary",
				"&::before": line,
				"&::after": line,
			}}
		>
			{label}
		</Box>
	);
}
