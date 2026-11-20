import { Box, Link, Typography } from "@mui/material";

export function RelatedPrRow({
	reference,
	url,
	line,
}: {
	reference: string;
	url: string;
	line: string;
}) {
	return (
		<Box
			component="li"
			sx={{
				display: "flex",
				gap: 1,
				alignItems: "baseline",
				minWidth: 0,
				px: 1,
				py: 0.75,
				bgcolor: "action.hover",
				borderRadius: 1,
			}}
		>
			<Link
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				variant="body2"
				underline="hover"
				sx={{ fontFamily: "fontFamilyMono", whiteSpace: "nowrap" }}
			>
				{reference}
			</Link>
			<Typography
				variant="caption"
				noWrap
				title={line}
				sx={{ color: "text.secondary", minWidth: 0 }}
			>
				{line}
			</Typography>
		</Box>
	);
}
