import { Box, Typography } from "@mui/material";

export function QuestionOptionPreview({
	label,
	preview,
}: {
	label: string;
	preview: string;
}) {
	return (
		<Box
			sx={{
				position: "sticky",
				top: 0,
				border: 1,
				borderColor: "divider",
				borderRadius: 1,
				overflow: "hidden",
				bgcolor: "background.default",
			}}
		>
			<Box
				sx={{
					px: 1.5,
					py: 1,
					display: "flex",
					gap: 1,
					borderBottom: 1,
					borderColor: "divider",
				}}
			>
				<Typography
					variant="caption"
					sx={{
						fontFamily: "fontFamilyMono",
						textTransform: "uppercase",
						color: "text.secondary",
					}}
				>
					Preview
				</Typography>
				<Typography variant="caption" sx={{ fontWeight: 500 }}>
					{label}
				</Typography>
			</Box>
			<Box
				component="pre"
				sx={{
					m: 0,
					px: 2,
					py: 1.5,
					minHeight: 160,
					fontFamily: "fontFamilyMono",
					fontSize: "caption.fontSize",
					whiteSpace: "pre",
					overflowX: "auto",
				}}
			>
				{preview}
			</Box>
		</Box>
	);
}
