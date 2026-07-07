import { Box, Typography } from "@mui/material";
import { MarkdownBlock } from "./MarkdownBlock";

const sectionHeadingSx = {
	color: "text.secondary",
	mb: 1,
	display: "block",
	letterSpacing: "0.08em",
} as const;

export function ItemDescription({ description }: { description?: string }) {
	if (!description) return null;
	return (
		<Box sx={{ mb: 2 }}>
			<Typography variant="overline" sx={sectionHeadingSx}>
				Description
			</Typography>
			<MarkdownBlock content={description} />
		</Box>
	);
}
